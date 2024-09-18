"use client";

import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './Keyword.module.css'
import Languages from './choices/Languages';
import VoiceTones from './choices/VoiceTones';
import WritingStyle from './choices/WritingStyle';
import Category from './choices/Category';

const KeywordForm: React.FC<{ onClose: () => void; handleSubmit: (message: string) => void }> = ({ onClose, handleSubmit }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [template, setTemplate] = useState<string>(''); 
  const [language, setLanguage] = useState<string>('English'); 
  const [voiceTone, setVoiceTone] = useState<string>('Default'); 
  const [writingStyle, setWritingStyle] = useState<string>('Default'); 
  const [textareaValue, setTextAreaValue] = useState<string>(''); 
  const [visible, setVisible] = useState<boolean>(true);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [topic, setTopic] = useState<string>('');
  const [totalPosts, setTotalPosts] = useState<string>('');
  const [audience, setAudience] = useState<string>('');
  const [threadsPerWeek, setThreadsPerWeek] = useState<string>('');
  const [totalMonths, setTotalMonths] = useState<string>('');
  const [instagramPost, setInstagramPost] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [instagramComment, setInstagramComment] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [postLength, setPostLength] = useState<string>('390 - 400 words');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [length, setLenght] = useState<string>('300');
  const [linkedinPost, setLinkedinPost] = useState<string>('');
  const [commentType, setCommentType] = useState<string>('appreciative');
  
  useEffect(() => {
    setSubCategory("");
    setTemplate("");
  }, [category]);

  useEffect(() => {
    setTemplate("");
  }, [subCategory]);

  useEffect(() => {
    updateTextAreaValue();
  }, [category, subCategory, template, language, voiceTone, writingStyle, topic, totalPosts, audience, threadsPerWeek, totalMonths, instagramPost, total, instagramComment, industry, postLength, jobDescription, length, linkedinPost, commentType]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [textareaValue]);

  const updateTextAreaValue = () => {
    let formattedText = `Please ignore all previous instructions. Please respond only in the ${language} language`;
    if (category === 'socialPost') {
      if(subCategory === 'Facebook') {
        formattedText = `${formattedText}. You are an expert Facebook marketer`;
        if(template === 'Ideje za Facebook objavu')
          formattedText = `${formattedText}. Generate ${totalPosts} ideas for Facebook posts on the topic "${topic}" that will engage the target audience - "${audience}". Include a CTA and hashtags wherever possible`;
        if(template === 'Kreiraj oglas')
          formattedText = `${formattedText} with expertise in Facebook Ads.  Please create ad copy for the product/service "${topic}". Please use the following guidelines: Create a compelling headline that grabs attention and highlights the main benefit of the product/service. The headline should be between 30-40 characters and its description field should be 20-25 characters. Then, create the primary ad text field. Use clear and concise language in the primary ad text field copy that focuses on the benefits of the product/service and addresses any potential objections. Include a strong call to action that encourages users to take the desired action. The primary ad text field should be 120-125 characters. Research the target audience demographics such as age, gender, location, interests, and other characteristics that would help you to have a better understanding of the target audience and create an ad that would be more appealing to them`;
        if(template === 'Zakaži Facebook objavu')
          formattedText = `${formattedText}. Please create a Facebook Post Calendar for ${totalMonths} months based on your product/service "${topic}" for your target audience "${audience}". There should be ${threadsPerWeek} Facebook posts scheduled each week of the month. Every Facebook post should have a catchy headline and description. Try to use unique emojis in the description. The description should have a hook and entice the readers. The table should have actual dates in the future. Each month should have its own table. The table columns should be: date, post idea description. Please organize each Facebook post in the table so that it looks like a calendar`;
      } else if(subCategory === 'Instagram') {
        formattedText = `${formattedText}. You are an Instagrammer with a large fan following`;
        if(template === 'Generiši opis za nalog')
          formattedText = `${formattedText}. Write a Instagram post description in just a few sentences for the post "${topic}". Make the description readable by formatting with new lines. Include emojis and the Instagram hashtags in the description. Try to use unique emojis in the description. The description should have a hook and entice the readers`;
        if(template === 'Zakaži objavu')
          formattedText = `${formattedText}. Please create a Instagram Post Calendar for ${totalMonths} months based on your interests "${topic}". There should be ${threadsPerWeek} Instagram posts scheduled each week of the month. Every Instagram post should have a catchy description. Include emojis and the Instagram hashtags in the description. Try to use unique emojis in the description. The description should have a hook and entice the readers. The table should have actual dates in the future. Each month should have its own table. The table columns should be: date, post idea description, caption without hashtags, hashtags. Please organize each instagram post in the table so that it looks like a calendar`;
        if(template === 'Generiši hashtag')
          formattedText = `${formattedText}. Please generate ${total} high performing Instagram hashtags for the following text: "${instagramPost}"`;
        if(template === 'Generiši odgovor na komentar')
          formattedText = `${formattedText}. You are a customer support agent who responds to instagram comments with empathy. Please create a response for a customer instagram comment. Please use relevant emojis.The customer comment is "${instagramComment}"`;
      } else if(subCategory === 'Linkedin') {
        if(template === 'Kreiraj Linkedin objavu')
          formattedText = `${formattedText}. You are a LinkedIn content creator. Your content should be engaging, informative, and relevant LinkedIn posts for various professionals across different industries. Please include industry insights, personal experiences, and thought leadership while maintaining a genuine and conversational tone. Please create a post about the ${topic} for the  industry. Add emojis to the content when appropriate and write from a personal experience. The content should be between ${postLength} long and spaced out so that it's easy for readers to scan through. Please add relevant hashtags to the post and encourage the readers to comment`;
        if(template === 'Generiši biografiju')
          formattedText = `${formattedText}. You are an expert LinkedIn Bio creator. Create a LinkedIn Bio for the following job description - "${jobDescription}". The bio should be ${length} characters long and should highlight the tops skills of the job mentioned`;
        if(template === 'Zakaži objavu')
          formattedText = `${formattedText}. You are an LinkedIn professional with a large fan following. Please create a LinkedIn Post Calendar for ${totalMonths} months based on your interests "${topic}". There should be ${threadsPerWeek} LinkedIn posts scheduled each week of the month. The Posts should be engaging, informative, and relevant to various LinkedIn professionals across different industries. Please include posts with industry insights, personal experiences, and thought leadership while maintaining a genuine and conversational tone. The markdown table should have actual dates in the future. Each month should have its own table. The table columns should be: Date, LinkedIn Post Idea, Hashtags. Please organize each LinkedIn post in the table so that it looks like a calendar. Do not self reference. Do not explain what you are doing. Reply back only with the table`;
        if(template === 'Generiši Linkedin hashtag')
          formattedText = `${formattedText}. You are a LinkedIn influencer with a large following. Please generate ${total} high performing hashtags for the following LinkedIn Post: "${linkedinPost}"`;
        if(template === 'Generiši komentar')
          formattedText = `${formattedText}. You are a LinkedIn influencer with a large following. Please create ${length} ${commentType} comments in response to the following LinkedIn Post: "${linkedinPost}"`;
        if(template === 'Kreiraj Linkedin oglas')
          formattedText = `${formattedText}. You are a sales manager with expertise in LinkedIn Ads creation. Generate 10 compelling LinkedIn ad headlines about the topic "${topic}". The headlines should be between 140 to 150 characters long. After this, generate ${length} compelling LinkedIn ad descriptions about the topics "${topic}". The descriptions should be between 60 to 70 characters long`;
      }
    }
    formattedText = `${formattedText}. You have a ${voiceTone} tone of voice. You have a ${writingStyle} writing style. Do not self reference. Do not explain what you are doing.`;
    setTextAreaValue(formattedText);
  };

  const subCategoriesMap: { [key: string]: string[] } = {
    blog: ["pisanjeBloga", "seoSaveti", "tehnickiBlogovi"],
    socialPost: ["Instagram", "Facebook", "Linkedin"],
    landingPage: ["konverzionaStranica", "proizvodnaStranica"],
    newsletter: ["promotivni", "informativni", "edukativni"],
    video: ["Youtube", "instrukcije", "vlog"],
    txtToPic: ["instagramSlika", "poster"],
  };

  const templateMap: { [key: string]: string[] } = {
    Instagram: ["Generiši opis za nalog", "Zakaži objavu", "Generiši hashtag", "Generiši odgovor na komentar"],
    Facebook: ["Ideje za Facebook objavu", "Kreiraj oglas", "Zakaži Facebook objavu"],
    Linkedin: ["Kreiraj Linkedin objavu", "Generiši biografiju", "Zakaži objavu", "Generiši Linkedin hashtag", "Generiši komentar", "Kreiraj Linkedin oglas"],
  };

  const handleExecute = () => {
    handleSubmit(textareaValue);
    handleClose();
  };

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose();
    history.replaceState(null, "", " "); 
  };

  return (
    <Draggable>
      <div className={styles.container}>
        <div className={styles.draggable}>
          <div className={styles.title}>
            <span>Generator upita</span>
          </div>
          <button className={styles.closeButton} onClick={handleClose}>
            ✖
          </button>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#fff', color: 'black' }}>
          <form className={styles.form}>
            <div className={styles.rowOfChoices}>
              <div className={styles.choice}>
                <label htmlFor="category" className={styles.label}>
                  Kategorija:
                </label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value)} className={styles.field}>
                  <Category />
                </select>
              </div>
              <div className={styles.choice}>
                <label htmlFor="subCategory" className={styles.label}>
                  Potkategorija:
                </label>
                <select id="subCategory" value={subCategory} onChange={e => setSubCategory(e.target.value)} className={styles.field} disabled={!category}>
                  <option value="">Izaberi potkategoriju</option>
                  {category && subCategoriesMap[category]?.map((subCategoryOption, index) => (
                    <option key={index} value={subCategoryOption}>
                      {subCategoryOption}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.choice}>
                <label htmlFor="template" className={styles.label}>
                  Templejt:
                </label>
                <select 
                  id="template" 
                  value={template} 
                  onChange={e => setTemplate(e.target.value)} 
                  className={styles.field} 
                  disabled={!subCategory} 
                >
                  <option value="">Izaberi templejt</option>
                  {subCategory && templateMap[subCategory]?.map((templateOption, index) => (
                    <option key={index} value={templateOption}>
                      {templateOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {template && (
              <>
                <div className={styles.rowOfChoices}>
                  <div className={styles.choice}>
                    <label htmlFor="language" className={styles.label}>
                      Jezik:
                    </label>
                    <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className={styles.field}>
                      <Languages />
                    </select>
                  </div>
                  <div className={styles.choice}>
                    <label htmlFor="voiceTone" className={styles.label}>
                      Ton glasa:
                    </label>
                    <select id="voiceTone" value={voiceTone} onChange={e => setVoiceTone(e.target.value)} className={styles.field}>
                      <VoiceTones />
                    </select>
                  </div>
                  <div className={styles.choice}>
                    <label htmlFor="writingStyle" className={styles.label}>
                      Stil pisanja:
                    </label>
                    <select id="writingStyle" value={writingStyle} onChange={e => setWritingStyle(e.target.value)} className={styles.field}>
                      <WritingStyle />
                    </select>
                  </div>
                </div>
                {template === "Ideje za Facebook objavu" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="topic" className={styles.label}>
                          Tema:
                        </label>
                        <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Unesite temu za Facebook objavu"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="totalPosts" className={styles.label}>
                          Ukupno objava:
                        </label>
                        <input
                        type="text"
                        id="totalPosts"
                        value={totalPosts}
                        onChange={(e) => setTotalPosts(e.target.value)}
                        placeholder="Unesite ukupan broj ideja za Facebook objavu"
                        className={styles.field}
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="audience" className={styles.label}>
                          Publika:
                        </label>
                        <input
                        type="text"
                        id="audience"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="Opiši tvoju publiku ovde"
                        className={styles.field}
                        />
                      </div>
                    </div>
                  </>
                )}
                {template === "Kreiraj oglas" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="topic" className={styles.label}>
                          Tema:
                        </label>
                        <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Unesite temu za Facebook objavu"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                  </>
                )}
                {template === "Zakaži Facebook objavu" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="topic" className={styles.label}>
                          Tema:
                        </label>
                        <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Unesite temu za Facebook objavu"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="threadsPerWeek" className={styles.label}>
                          Broj tema po nedelji:
                        </label>
                        <input
                        type="number"
                        id="threadsPerWeek"
                        value={threadsPerWeek}
                        onChange={(e) => setThreadsPerWeek(e.target.value)}
                        min="1"
                        className={styles.field}
                        placeholder="Unesite broj tema koji želite da zakažete po jednoj nedelji"
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="totalMonths" className={styles.label}>
                          Ukupno meseci:
                        </label>
                        <input
                        type="number"
                        id="totalMonths"
                        value={totalMonths}
                        onChange={(e) => setTotalMonths(e.target.value)}
                        min="1"
                        className={styles.field}
                        placeholder="Unesite ukupan broj meseci"
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="audience" className={styles.label}>
                          Publika:
                        </label>
                        <input
                        type="text"
                        id="audience"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        placeholder="Opiši tvoju publiku ovde"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                  </>
                )}
                {template === "Generiši opis za nalog" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="topic" className={styles.label}>
                          Tema:
                        </label>
                        <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Unesite temu za Instagram objavu"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                  </>
                )}
                {template === "Zakaži objavu" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="topic" className={styles.label}>
                          Tema:
                        </label>
                        <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Unesite temu za Instagram objavu"
                        className={styles.field}
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="threadsPerWeek" className={styles.label}>
                          Broj objava nedeljno:
                        </label>
                        <input
                        type="number"
                        id="threadsPerWeek"
                        value={threadsPerWeek}
                        onChange={(e) => setThreadsPerWeek(e.target.value)}
                        min="1"
                        className={styles.field}
                        placeholder="Unesite broj objava po jednoj nedelji"
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="totalMonths" className={styles.label}>
                          Ukupno meseci:
                        </label>
                        <input
                        type="number"
                        id="totalMonths"
                        value={totalMonths}
                        onChange={(e) => setTotalMonths(e.target.value)}
                        min="1"
                        className={styles.field}
                        placeholder="Unesite ukupan broj meseci"
                        />
                      </div>   
                    </div>
                  </>
                )}
                {template === "Generiši hashtag" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="instagramPost" className={styles.label}>
                          Instagram objava:
                        </label>
                        <input
                        type="text"
                        id="instagramPost"
                        value={instagramPost}
                        onChange={(e) => setInstagramPost(e.target.value)}
                        placeholder="Dodajte Instagram objavu"
                        className={styles.field}
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="total" className={styles.label}>
                          Ukupno:
                        </label>
                        <input
                        type="number"
                        id="total"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                        min="1"
                        className={styles.field}
                        placeholder="Unesite ukupan broj hashtaga koji želite da se generiše"
                        />
                      </div>  
                    </div>
                  </>
                )}
                {template === "Generiši odgovor na komentar" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="instagramComment" className={styles.label}>
                          Instagram komentar:
                        </label>
                        <input
                        type="text"
                        id="instagramComment"
                        value={instagramComment}
                        onChange={(e) => setInstagramComment(e.target.value)}
                        placeholder="Unesite komentar sa Instagrama"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                  </>
                )}
                {template === "Kreiraj Linkedin objavu" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="topic" className={styles.label}>
                          Tema:
                        </label>
                        <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Unesite temu za Linkedin objavu"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="industry" className={styles.label}>
                          Industrija:
                        </label>
                        <input
                        type="text"
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Unesite industriju koju želite da ciljate"
                        className={styles.field}
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="postLength" className={styles.label}>
                          Dužina objave:
                        </label>
                        <input
                        type="text"
                        id="postLength"
                        value={postLength}
                        onChange={(e) => setPostLength(e.target.value)}
                        placeholder="Koliko reči želiš da ChatGPT generiše?"
                        className={styles.field}
                        />
                      </div>    
                    </div>
                  </>
                )}
                {template === "Generiši biografiju" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="jobDescription" className={styles.label}>
                          Opis posla:
                        </label>
                        <input
                        type="text"
                        id="jobDescription"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Unesite opis posla koji radite"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="length" className={styles.label}>
                          Dužina:
                        </label>
                        <input
                        type="number"
                        id="length"
                        value={length}
                        onChange={(e) => setLenght(e.target.value)}
                        placeholder="Unesite maksimalan broj karaktera u biografiji"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                  </>
                )}
                {template === "Generiši Linkedin hashtag" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="linkedinPost" className={styles.label}>
                          Linkedin objava:
                        </label>
                        <input
                        type="text"
                        id="linkedinPost"
                        value={linkedinPost}
                        onChange={(e) => setLinkedinPost(e.target.value)}
                        placeholder="Dodajte Linkedin objavu"
                        className={styles.field}
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="total" className={styles.label}>
                          Ukupno:
                        </label>
                        <input
                        type="number"
                        id="total"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                        min="1"
                        className={styles.field}
                        placeholder="Unesite ukupan broj hashtaga koji želite da se generiše"
                        />
                      </div>  
                    </div>
                  </>
                )}
                {template === "Generiši komentar" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="linkedinPost" className={styles.label}>
                          Linkedin objava:
                        </label>
                        <input
                        type="text"
                        id="linkedinPost"
                        value={linkedinPost}
                        onChange={(e) => setLinkedinPost(e.target.value)}
                        placeholder="Unesite Linkedin objavu"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="length" className={styles.label}>
                          Dužina:
                        </label>
                        <input
                        type="number"
                        id="length"
                        value={length}
                        onChange={(e) => setLenght(e.target.value)}
                        placeholder="Unesite maksimalan broj karaktera u biografiji"
                        className={styles.field}
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="commentType" className={styles.label}>
                          Tip komentara:
                        </label>
                        <input
                        type="text"
                        id="commentType"
                        value={commentType}
                        onChange={(e) => setCommentType(e.target.value)}
                        placeholder="Unesite tip komentara koji želite da se generiše - appreciative, in agreement, in disagreement etc"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                  </>
                )}
                {template === "Kreiraj Linkedin oglas" && (
                  <>
                    <div className={styles.rowOfChoices}>
                      <div className={styles.choice}>
                        <label htmlFor="topic" className={styles.label}>
                          Tema:
                        </label>
                        <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Unesite temu za Linkedin oglas"
                        className={styles.field}
                        />
                      </div>
                      <div className={styles.choice}>
                        <label htmlFor="length" className={styles.label}>
                          Dužina:
                        </label>
                        <input
                        type="number"
                        id="length"
                        value={length}
                        onChange={(e) => setLenght(e.target.value)}
                        placeholder="Unesite ukupan broj naslova i opisa koji želite da generišete"
                        className={styles.field}
                        />
                      </div>   
                    </div>
                  </>
                )}
                <div className={styles.prompt}>
                  <label htmlFor="textarea" className={styles.label}>
                    Prompt Template:
                  </label>
                  <textarea
                    id="textarea"
                    ref={textAreaRef} 
                    value={textareaValue}
                    onChange={e => setTextAreaValue(e.target.value)}
                    className={styles.field}
                    style={{ overflow: 'hidden', resize: 'none'}}
                  />
                </div>
                <div className={styles.buttonContainer}>
                  <button type="button" onClick={handleExecute} className={styles.executeTemplateButton}>
                    Pošalji poruku
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </Draggable>
  );
};

export default KeywordForm;
