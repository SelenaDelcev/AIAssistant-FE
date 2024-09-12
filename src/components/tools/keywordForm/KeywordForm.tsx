"use client";

import { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import styles from './Keyword.module.css'
import Languages from './choices/Languages';
import VoiceTones from './choices/VoiceTones';
import WritingStyle from './choices/WritingStyle';
import Category from './choices/Category';

const KeywordForm: React.FC<{ handleSubmit: (message: string) => void, onClose: () => void }> = ({ handleSubmit, onClose }) => {
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [template, setTemplate] = useState<string>('');
  const [language, setLanguage] = useState<string>('English'); 
  const [voiceTone, setVoiceTone] = useState<string>('Default'); 
  const [writingStyle, setWritingStyle] = useState<string>('Default'); 
  const [textareaValue, setTextAreaValue] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    updateTextAreaValue();
  }, [category, subCategory, template, language, voiceTone, writingStyle]);

  const updateTextAreaValue = () => {
    //ovde ide get endpoint prema backendu
    const formattedText = `${category} ${subCategory} ${template} ${language} ${voiceTone} ${writingStyle}`;
    setTextAreaValue(formattedText);
  };

  const subCategoriesMap: { [key: string]: string[] } = {
    blog: ["pisanjeBloga", "seoSaveti", "tehnickiBlogovi"],
    socialPost: ["instagram", "facebook", "twitter", "linkedin"],
    landingPage: ["konverzionaStranica", "proizvodnaStranica"],
    newsletter: ["promotivni", "informativni", "edukativni"],
    video: ["youtube", "instrukcije", "vlog"],
    txtToPic: ["instagramSlika", "poster"],
  };

  const templateMap: { [key: string]: string[] } = {
    instagram: ["Template11", "Template12"],
    facebook: ["Template21", "Template22"],
    twitter: ["Template31", "Template32"],
    linkedin: ["Template41", "Template42"],
  };

  const handleExecute = () => {
    handleSubmit("Prompt:"+textareaValue); 
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
            <span>AI Assistant</span>
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

                <div className={styles.prompt}>
                  <label htmlFor="textarea" className={styles.label}>
                    Prompt Template:
                  </label>
                  <textarea id="textarea" value={textareaValue} onChange={e => setTextAreaValue(e.target.value)} className={styles.field} />
                </div>

                <div className={styles.buttonContainer}>
                  <button type="button" onClick={handleExecute} className={styles.executeTemplateButton}>
                    Execute Template
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
