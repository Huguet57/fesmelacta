import React, { useState, useEffect } from 'react';
import { loadModelFromIndexedDB, saveModelToIndexedDB } from '../utils/indexedDB';
import { fetchModel } from '../utils/models';
import LanguageSelector from './model/LanguageSelector';

const ModelLoader = ({ processor, success, error }) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [model, setModel] = useState(null);

  const loadModel = async (modelName) => {
    try {
      const model = await loadModelFromIndexedDB();

      if (model) {
            processor?.setModel(model);
            saveModelToIndexedDB(model);

          setLoading(false);
          setLoaded(true);
          setModel(modelName);
            success();
      } else {
          fetchModel(modelName)
              .then(model => {
                    processor?.setModel(model);
                    saveModelToIndexedDB(model);

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

  return (
    <div>
      { loaded && <div>Model: {model}</div> }
      <button onClick={() => loadModel('tiny')}>Load Tiny Model</button>
      <LanguageSelector processor={processor} />
    </div>
  );
}

export default ModelLoader;