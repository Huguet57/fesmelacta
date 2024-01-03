import React, { useState, useEffect } from 'react';
import { loadModelFromIndexedDB, saveModelToIndexedDB } from '../utils/indexedDB';
import { fetchModel } from '../utils/models';
import LanguageSelector from './model/LanguageSelector';

const ModelLoaded = ({ loaded, modelName }) => {
  const nameMap = {
    small: 'ràpida',
    medium: 'de qualitat',
  };

  if (!loaded) {
    return null;
  }

  return (
    <div
      style={{
        fontSize: '12px',
        marginBottom: '10px',
      }}
    >
      Utilitzant model de transcripció {nameMap[modelName]}.
    </div>
  );
}

const ModelLoader = ({ processor, success, error, state }) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [model, setModel] = useState(null);

  const loadModel = async (modelName) => {
    try {
      const model = await loadModelFromIndexedDB(modelName);

      if (model) {
            processor?.setModel(model);
            saveModelToIndexedDB(modelName, model);

          setLoading(false);
          setLoaded(true);
          setModel(modelName);
            success();
      } else {
          fetchModel(modelName)
              .then(model => {
                    processor?.setModel(model);
                    saveModelToIndexedDB(modelName, model);

                    setLoading(false);
                    setLoaded(true);
                    setModel(modelName);
                    success();
              })
              .catch(err => {
                    setLoading(false);
                    error(err);
                });
      }
    } catch (err) {
      setLoading(false);
      error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const isDisabled = 3 < state && state < 7;

  return (
    <div>
      {/* <ModelLoaded loaded={loaded} modelName={model} /> */}
      <button className={model === 'small' ? 'selected' : ''} disabled={isDisabled} onClick={() => loadModel('small')}>Transcripció ràpida (190 MB)</button>
      <button className={model === 'medium' ? 'selected' : ''} disabled={isDisabled} onClick={() => loadModel('medium')}>Transcripció de qualitat (514 MB)</button>
    </div>
  );
}

export default ModelLoader;