import React, { useEffect, useState } from 'react';

const LanguageSelector = ({ processor, state }) => {
  const [language, setLanguage] = useState('ca');
  const isDisabled = 3 < state && state < 7;

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  useEffect(() => {
    processor?.setLanguage(language);
  }, [language]);

  return (
    <div>
      <label htmlFor="language">Idioma:</label>

      <select
        id="language"
        name="language"
        value={language}
        onChange={handleLanguageChange}
        disabled={isDisabled}
      >
        <option value="ca">Català</option>
        <option value="es">Castellà</option>
        <option value="en">Anglès</option>

        <option value="de">Alemany</option>
        <option value="ar">Àrab</option>
        <option value="hy">Armeni</option>
        <option value="az">Azerbaidjanès</option>
        <option value="eu">Basc</option>
        <option value="be">Bielorús</option>
        <option value="bn">Bengalí</option>
        <option value="bg">Búlgar</option>
        <option value="hr">Croat</option>
        <option value="ko">Coreà</option>
        <option value="da">Danès</option>
        <option value="nl">Holandès</option>
        <option value="sk">Eslovac</option>
        <option value="sl">Eslovè</option>
        <option value="et">Estonià</option>
        <option value="tl">Filipí</option>
        <option value="fi">Finès</option>
        <option value="fr">Francès</option>
        <option value="gl">Gallec</option>
        <option value="ka">Georgià</option>
        <option value="cy">Gal·lès</option>
        <option value="el">Grec</option>
        <option value="gu">Gujarati</option>
        <option value="iw">Hebreu</option>
        <option value="hi">Hindi</option>
        <option value="hu">Hongarès</option>
        <option value="is">Islandès</option>
        <option value="id">Indonesi</option>
        <option value="ga">Irlandès</option>
        <option value="it">Italià</option>
        <option value="ja">Japonès</option>
        <option value="yi">Jiddisch</option>
        <option value="kn">Kannada</option>
        <option value="la">Llatí</option>
        <option value="lv">Letó</option>
        <option value="lt">Lituà</option>
        <option value="mk">Macedoni</option>
        <option value="ms">Malai</option>
        <option value="mt">Maltès</option>
        <option value="no">Noruec</option>
        <option value="fa">Persa</option>
        <option value="pl">Polonès</option>
        <option value="pt">Portuguès</option>
        <option value="ro">Romanès</option>
        <option value="ru">Rus</option>
        <option value="sr">Serbi</option>
        <option value="sw">Swahili</option>
        <option value="sv">Suec</option>
        <option value="ta">Tàmil</option>
        <option value="te">Telugu</option>
        <option value="th">Tailandès</option>
        <option value="tr">Turc</option>
        <option value="cs">Txec</option>
        <option value="uk">Ucraïnès</option>
        <option value="ur">Urdú</option>
        <option value="vi">Vietnamita</option>
        <option value="zh">Xinès</option>
      </select>
    </div>
  );
};

export default LanguageSelector;