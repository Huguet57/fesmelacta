import React, { useState, useEffect } from 'react';
import { loadModelFromIndexedDB, saveModelToIndexedDB } from '../utils/indexedDB';
import { fetchModel, modelSizes } from '../utils/models';
import ProgressBar from './model/ProgressBar';
import localforage from 'localforage';

const ModelLoader = ({ processor, success, error, state }) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [model, setModel] = useState(null);
  const [progress, setProgress] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const [savedModels, setSavedModels] = useState({});
  
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
          const confirmed = window.confirm(
            'Estàs a punt de descarregar ' + (modelSizes?.[modelName] || '?') + ' MB de dades.\n' +
            'Les dades del model es desaran en la memòria del navegador per a ús futur i no hauràs de tornar a descarregar-lo.\n\n' +
            'Prem OK per continuar.'
          );

          if (!confirmed) return;

          setDownloading(modelName);

          fetchModel(modelName, setProgress)
              .then(model => {
                    processor?.setModel(model);
                    saveModelToIndexedDB(modelName, model);
                    
                    setDownloading(null);
                    setLoading(false);
                    setLoaded(true);
                    setModel(modelName);
                    success();
              })
              .catch(err => {
                    setDownloading(null);
                    setLoading(false);
                    error(err);
                });
      }
    } catch (err) {
      setLoading(false);
      error(err);
    }
  };

  useEffect(() => {
    localforage.keys()
      .then(keys => {
        keys.forEach(key => {
          // Check if 'small' model is already in localforage
          if (key.includes('small')) {
            setSavedModels(prev => ({ ...prev, small: true }));
          
          // Check if 'medium' model is already in localforage
          } else if (key.includes('medium')) {
            setSavedModels(prev => ({ ...prev, medium: true }));
          }
        })
      })
  }, [
    loaded,
  ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const isDisabled = 3 < state && state < 7;

  return (
    <div>
      {/* <ModelLoaded loaded={loaded} modelName={model} /> */}
      <button className={(model === 'small' ? 'selected' : '') + (downloading === 'small' ? 'downloading' : '')} disabled={isDisabled} onClick={() => loadModel('small')}>Transcripció ràpida{ !savedModels['small'] && <> (190 MB)</> }</button>
      <button className={(model === 'medium' ? 'selected' : '') + (downloading === 'medium' ? 'downloading' : '')} disabled={isDisabled} onClick={() => loadModel('medium')}>Transcripció de qualitat{ !savedModels['medium'] && <> (514 MB)</> }</button>

      { (0 < progress && progress < 100) && <ProgressBar progress={progress} /> }
    </div>
  );
}

export default ModelLoader;