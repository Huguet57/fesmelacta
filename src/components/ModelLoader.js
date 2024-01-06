import React, { useState, useEffect } from 'react';
import { loadModelFromIndexedDB, saveModelToIndexedDB } from '../utils/indexedDB';
import { fetchModel, modelSizes } from '../utils/models';
import ProgressBar from './model/ProgressBar';
import localforage from 'localforage';
import SideBySide from './extra/SideBySide';

const ModelLoader = ({ processor, success, error, state, setState }) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [model, setModel] = useState(null);
  const [progress, setProgress] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const [savedModels, setSavedModels] = useState({});
  
  const isDisabled = 3 < state && state < 7;

  const cancel = () => {
    processor?.kill();
    setState(8);
  }

  const loadModel = async (modelName) => {
    if (isDisabled) return;

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

          // Check if 'base' model is already in localforage
          } else if (key.includes('base')) {
            setSavedModels(prev => ({ ...prev, base: true }));
          }
        })
      })
  }, [
    loaded,
  ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SideBySide
      justifyContent='space-between'
    >
      <div>
        <button className={(model === 'base' ? 'selected' : '') + (downloading === 'base' ? 'downloading' : '')} onClick={() => loadModel('base')}>Transcripció ràpida{ !savedModels['base'] && <> (57 MB)</> }</button>
        {/* <button className={(model === 'small' ? 'selected' : '') + (downloading === 'small' ? 'downloading' : '')} onClick={() => loadModel('small')}>Transcripció ràpida{ !savedModels['small'] && <> (190 MB)</> }</button> */}
        <button className={(model === 'medium' ? 'selected' : '') + (downloading === 'medium' ? 'downloading' : '')} onClick={() => loadModel('medium')}>Transcripció de qualitat{ !savedModels['medium'] && <> (514 MB)</> }</button>
        
        { (0 < progress && progress < 100) && <ProgressBar progress={progress} /> }
      </div>
      {
        (3 < state && state < 7) && <div>
          <button className='cancel' onClick={cancel}>Para la transcripció</button>
        </div>
      }
    </SideBySide>
  );
}

export default ModelLoader;