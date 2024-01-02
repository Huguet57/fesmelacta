import React, { useEffect, useState } from 'react';

const LanguageSelector = ({ processor }) => {
  const [language, setLanguage] = useState('ca');

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  useEffect(() => {
    processor?.setLanguage(language);
  }, [language]);

  return (
    <select id="language" name="language" value={language} onChange={handleLanguageChange}>
      <option value="ca">Catalan</option>
      <option value="ar">Arabic</option>
      <option value="hy">Armenian</option>
      <option value="az">Azerbaijani</option>
      <option value="eu">Basque</option>
      <option value="be">Belarusian</option>
      <option value="bn">Bengali</option>
      <option value="bg">Bulgarian</option>
      <option value="ca">Catalan</option>
      <option value="zh">Chinese</option>
      <option value="hr">Croatian</option>
      <option value="cs">Czech</option>
      <option value="da">Danish</option>
      <option value="nl">Dutch</option>
      <option value="en">English</option>
      <option value="et">Estonian</option>
      <option value="tl">Filipino</option>
      <option value="fi">Finnish</option>
      <option value="fr">French</option>
      <option value="gl">Galician</option>
      <option value="ka">Georgian</option>
      <option value="de">German</option>
      <option value="el">Greek</option>
      <option value="gu">Gujarati</option>
      <option value="iw">Hebrew</option>
      <option value="hi">Hindi</option>
      <option value="hu">Hungarian</option>
      <option value="is">Icelandic</option>
      <option value="id">Indonesian</option>
      <option value="ga">Irish</option>
      <option value="it">Italian</option>
      <option value="ja">Japanese</option>
      <option value="kn">Kannada</option>
      <option value="ko">Korean</option>
      <option value="la">Latin</option>
      <option value="lv">Latvian</option>
      <option value="lt">Lithuanian</option>
      <option value="mk">Macedonian</option>
      <option value="ms">Malay</option>
      <option value="mt">Maltese</option>
      <option value="no">Norwegian</option>
      <option value="fa">Persian</option>
      <option value="pl">Polish</option>
      <option value="pt">Portuguese</option>
      <option value="ro">Romanian</option>
      <option value="ru">Russian</option>
      <option value="sr">Serbian</option>
      <option value="sk">Slovak</option>
      <option value="sl">Slovenian</option>
      <option value="es">Spanish</option>
      <option value="sw">Swahili</option>
      <option value="sv">Swedish</option>
      <option value="ta">Tamil</option>
      <option value="te">Telugu</option>
      <option value="th">Thai</option>
      <option value="tr">Turkish</option>
      <option value="uk">Ukrainian</option>
      <option value="ur">Urdu</option>
      <option value="vi">Vietnamese</option>
      <option value="cy">Welsh</option>
      <option value="yi">Yiddish</option>
    </select>
  );
};

export default LanguageSelector;