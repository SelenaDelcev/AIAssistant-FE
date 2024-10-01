import json
from myfunc.mssql import work_prompts
from openai import OpenAI
from os import getenv
from pinecone import Pinecone
from pinecone_text.sparse import BM25Encoder
import requests

mprompts = work_prompts()

choose_rag = """
You are a helpful assistant capable of using various tools to answer questions. Your responses should be in a structured JSON format, indicating which tool to use for the given user query. Return only the tool name, nothin else. The tools are:   
 - Hybrid: This tool performs a hybrid search process using Pinecone database to find the relevant company data. Always use this tool if the question is related to the company 'Positive d.o.o.', any kind of business/work-related solutions or specific people (e.g. employees, management, etc.)        
 - WebSearchProcess: This tool uses Google Search to find the most relevant and up-to-date information on the web.        
 - DirectResponse: This tool will perform a regular LLM completion based on the user query. Use this tool if the question is general and doesn't require a specific search process.
"""

def get_openai_client():
    return OpenAI(api_key = getenv("OPENAI_API_KEY"))

client = get_openai_client()

def get_hybrid_query_processor():
    return HybridQueryProcessor()

def get_structured_decision_from_model(user_query):
    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
        {"role": "system", "content": choose_rag},
        {"role": "user", "content": f"Please provide the response in JSON format: {user_query}"}
    ],
    )
    json_string = response.choices[0].message.content
    # Parse the JSON string into a Python dictionary
    data_dict = json.loads(json_string)
    # Access the 'tool' value
    return data_dict['tool'] if 'tool' in data_dict else list(data_dict.values())[0]


def connect_to_pinecone(x):
    pinecone_api_key = getenv('PINECONE_API_KEY')
    pinecone_host = "https://delfi-a9w1e6k.svc.aped-4627-b74a.pinecone.io" if x == 0 else "https://neo-positive-a9w1e6k.svc.apw5-4e34-81fa.pinecone.io"
    return Pinecone(api_key=pinecone_api_key, host=pinecone_host).Index(host=pinecone_host)


class HybridQueryProcessor:
    """
    A processor for executing hybrid queries using Pinecone.

    This class allows the execution of queries that combine dense and sparse vector searches,
    typically used for retrieving and ranking information based on text data.

    Attributes:
        api_key (str): The API key for Pinecone.
        environment (str): The Pinecone environment setting.
        alpha (float): The weight used to balance dense and sparse vector scores.
        score (float): The score treshold.
        index_name (str): The name of the Pinecone index to be used.
        index: The Pinecone index object.
        namespace (str): The namespace to be used for the Pinecone index.
        top_k (int): The number of results to be returned.
            
    Example usage:
    processor = HybridQueryProcessor(api_key=environ["PINECONE_API_KEY"], 
                                 environment=environ["PINECONE_API_KEY"],
                                 alpha=0.7, 
                                 score=0.35,
                                 index_name='custom_index'), 
                                 namespace=environ["NAMESPACE"],
                                 top_k = 10 # all params are optional

    result = processor.hybrid_query("some query text")    
    """

    def __init__(self, **kwargs):
        """
        Initializes the HybridQueryProcessor with optional parameters.

        The API key and environment settings are fetched from the environment variables.
        Optional parameters can be passed to override these settings.

        Args:
            **kwargs: Optional keyword arguments:
                - api_key (str): The API key for Pinecone (default fetched from environment variable).
                - environment (str): The Pinecone environment setting (default fetched from environment variable).
                - alpha (float): Weight for balancing dense and sparse scores (default 0.5).
                - score (float): Weight for balancing dense and sparse scores (default 0.05).
                - index_name (str): Name of the Pinecone index to be used (default 'positive').
                - namespace (str): The namespace to be used for the Pinecone index (default fetched from environment variable).
                - top_k (int): The number of results to be returned (default 6).
        """
        self.api_key = kwargs.get('api_key', getenv('PINECONE_API_KEY'))
        self.environment = kwargs.get('environment', getenv('PINECONE_API_KEY'))
        self.alpha = kwargs.get('alpha', 0.5)  # Default alpha is 0.5
        self.score = kwargs.get('score', 0.05)  # Default score is 0.05
        self.index_name = kwargs.get('index', 'neo-positive')  # Default index is 'positive'
        self.namespace = kwargs.get('namespace', getenv("NAMESPACE"))  
        self.top_k = kwargs.get('top_k', 5)  # Default top_k is 5
        self.delfi_special = kwargs.get('delfi_special')
        self.index = connect_to_pinecone(self.delfi_special)
        self.host = getenv("PINECONE_HOST")

    def hybrid_score_norm(self, dense, sparse):
        """
        Normalizes the scores from dense and sparse vectors using the alpha value.

        Args:
            dense (list): The dense vector scores.
            sparse (dict): The sparse vector scores.

        Returns:
            tuple: Normalized dense and sparse vector scores.
        """
        return ([v * self.alpha for v in dense], 
                {"indices": sparse["indices"], 
                 "values": [v * (1 - self.alpha) for v in sparse["values"]]})
    
    def hybrid_query(self, upit, top_k=None, filter=None, namespace=None):
        # Get embedding and unpack results
        dense = self.get_embedding(text=upit)

        # Use those results in another function call
        hdense, hsparse = self.hybrid_score_norm(
            sparse=BM25Encoder().fit([upit]).encode_queries(upit),
            dense=dense
        )

        query_params = {
            'top_k': top_k or self.top_k,
            'vector': hdense,
            'sparse_vector': hsparse,
            'include_metadata': True,
            'namespace': namespace or self.namespace
        }

        if filter:
            query_params['filter'] = filter

        response = self.index.query(**query_params)
        matches = response.to_dict().get('matches', [])
        results = []

        for match in matches:
            try:
                metadata = match.get('metadata', {})

                # Create the result entry with all metadata fields
                result_entry = metadata.copy()

                # Ensure mandatory fields exist with default values if they are not in metadata
                result_entry.setdefault('context', '')
                result_entry.setdefault('chunk', None)
                result_entry.setdefault('source', None)
                result_entry.setdefault('score', match.get('score', 0))

                # Only add to results if 'context' exists
                if result_entry['context']:
                    results.append(result_entry)
            except Exception as e:
                # Log or handle the exception if needed
                print(f"An error occurred: {e}")
                pass

        return results
       
    def process_query_results(self, upit, dict=False):
        """
        Processes the query results and prompt tokens based on relevance score and formats them for a chat or dialogue system.
        Additionally, returns a list of scores for items that meet the score threshold.
        """
        tematika = self.hybrid_query(upit)
        if not dict:
            uk_teme = ""
            
            for item in tematika:
                if item["score"] > self.score:
                    # Build the metadata string from all relevant fields
                    metadata_str = "\n".join(f"{key}: {value}" for key, value in item.items())
                    # Append the formatted metadata string to uk_teme
                    uk_teme += metadata_str + "\n\n"
            
            return uk_teme
        else:
            return tematika
        
    def get_embedding(self, text, model="text-embedding-3-large"):

        """
        Retrieves the embedding for the given text using the specified model.

        Args:
            text (str): The text to be embedded.
            model (str): The model to be used for embedding. Default is "text-embedding-3-large".

        Returns:
            list: The embedding vector of the given text.
            int: The number of prompt tokens used.
        """
        
        text = text.replace("\n", " ")
        result = client.embeddings.create(input=[text], model=model).data[0].embedding
       
        return result


def perform_web_search(query: str):
    """
    Perform a web search using Serper API.

    Args:
        query (str): The search query string.

    Returns:
        dict: The JSON response from Serper API.
    """
    url = "https://google.serper.dev/search"
    headers = {
        "X-API-KEY": getenv("SERPER_API_KEY"),
        "Content-Type": "application/json"
    }

    payload = {
        "q": query
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return str(response.json())
    except requests.exceptions.HTTPError as http_err:
        return f"HTTP error occurred: {http_err}"
    except Exception as err:
        return f"An error occurred: {err}"


def rag_tool_answer(prompt):
    context = " "
    rag_tool = get_structured_decision_from_model(prompt)

    if rag_tool == "Hybrid":
        processor = HybridQueryProcessor(namespace="embedding-za-sajt", delfi_special=1)
        context = processor.process_query_results(prompt)

    elif rag_tool == "WebSearchProcess":
        context = perform_web_search(prompt)
        
    elif rag_tool == "DirectResponse":
        context = "The given question doesn't require a specific tool to answer. General response is enough. Generate an answer on your own."
        
    return context

system_prompt = mprompts["sys_ragbot"]