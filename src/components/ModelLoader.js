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
  const [isGPUEnabled, setIsGPUEnabled] = useState(false);

  const [savedModels, setSavedModels] = useState({});
  
  const isDisabled = 3 < state && state < 7;

  const cancel = () => {
    processor?.kill();
    setState(8);
  }

  const loadModel = async (modelName) => {
    if (isDisabled) return;
    if (!modelName) return;
    if (downloading) return;

    try {
      const isGPUmodel = modelName.toLowerCase().includes('gpu');
      const model = await loadModelFromIndexedDB(modelName);

      if (model) {
        processor?.setModel(modelName, model);
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
                    processor?.setModel(modelName, model);
                    saveModelToIndexedDB(modelName, model);
                    setSavedModels(prev => ({ ...prev, [modelName]: model }));
                    
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
    // Check if GPU is enabled
    if ('gpu' in navigator) {
      navigator.gpu.requestAdapter()
          .then(adapter => {
              if (adapter) return adapter.requestDevice()
              else throw new Error('No adapter found');
          })
          .then(device => setIsGPUEnabled(device ? true : false))
          .catch(err => setIsGPUEnabled(false));
  } else {
      setIsGPUEnabled(false);
  }
  }, [
    // No dependencies
  ])

  useEffect(() => {
    localforage.keys()
      .then(keys => {
        keys.forEach(key => {
          // Check if 'small' model is already in localforage
          if (key === 'small') {
            setSavedModels(prev => ({ ...prev, small: true }));
          
          // Check if 'medium' model is already in localforage
          } else if (key === 'medium') {
            setSavedModels(prev => ({ ...prev, medium: true }));

          // Check if 'base' model is already in localforage
          } else if (key === 'base') {
            setSavedModels(prev => ({ ...prev, base: true }));
          }

          // Check if 'base-gpu' model is already in localforage
          else if (key === 'base-gpu') {
            setSavedModels(prev => ({ ...prev, 'base-gpu': true }));
          }

          // Check if 'small-gpu' model is already in localforage
          else if (key === 'small-gpu') {
            setSavedModels(prev => ({ ...prev, 'small-gpu': true }));
          }

          // Check if 'medium-gpu' model is already in localforage
          else if (key === 'medium-gpu') {
            setSavedModels(prev => ({ ...prev, 'medium-gpu': true }));
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
        { !isGPUEnabled && <button className={(model === 'base' ? 'selected' : '') + (downloading === 'base' ? 'downloading' : '')} onClick={() => loadModel('base')}>Transcripció ràpida{ !savedModels['base'] && <> (57 MB)</> }</button> }
        { isGPUEnabled && <button className={(model === 'base-gpu' ? 'selected' : '') + (downloading === 'base-gpu' ? 'downloading' : '')} onClick={() => loadModel('base-gpu')}>Transcripció ràpida{ !savedModels['base-gpu'] && <> (92 MB)</> }</button> }
        
        { true && <button className={(model === 'medium' ? 'selected' : '') + (downloading === 'medium' ? 'downloading' : '')} onClick={() => loadModel('medium')}>🐌 Transcripció de qualitat{ !savedModels['medium'] && <> (514 MB)</> }</button> }
        { isGPUEnabled && <button className={(model === 'medium-gpu' ? 'selected' : '') + (downloading === 'medium-gpu' ? 'downloading' : '')} onClick={() => loadModel('medium-gpu')}>🔥 Transcripció de qualitat{ !savedModels['medium-gpu'] && <> (927 MB)</> }</button> }

        { (0 < progress && progress < 100) && <ProgressBar progress={progress} /> }

        {
          model === 'base' ? <p style={{ marginBottom: 0 }}>Per transcripcions ràpides, per veure ràpid de què va la conversa.</p> :
          model === 'base-gpu' ? <p style={{ marginBottom: 0 }}>Per transcripcions ràpides, per veure ràpid de què va la conversa. Potser diu que hi ha música quan no n'hi ha.</p> :
          model === 'medium' ? <p style={{ marginBottom: 0 }}>Lenta però segura. Transcripció d'alta qualitat.</p> :
          model === 'medium-gpu' ? <p style={{ marginBottom: 0 }}>Transcripció d'alta qualitat, 4 cops més ràpida. Potser diu que hi ha música quan no n'hi ha.</p> :
          null
        }
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