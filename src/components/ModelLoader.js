import React, { useState, useEffect } from 'react';
import { loadModelFromIndexedDB, saveModelToIndexedDB } from '../utils/indexedDB';
import { fetchModel, modelSizes } from '../utils/models';
import ProgressBar from './model/ProgressBar';
import localforage from 'localforage';
import SideBySide from './extra/SideBySide';
import {
  AvailableModels,
  InferenceSession,
  SessionManager,
  Segment,
  DecodingOptionsBuilder,
  initialize,
  Task
} from "whisper-turbo";

const gpuModelsHashTable = {
  'base-gpu': AvailableModels.WHISPER_BASE,
  'small-gpu': AvailableModels.WHISPER_SMALL,
  'medium-gpu': AvailableModels.WHISPER_MEDIUM,
}

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
    if (!modelName) return;
    if (downloading) return;

    try {
      const isGPUmodel = modelName.toLowerCase().includes('gpu');
      const model = await loadModelFromIndexedDB(modelName);

      if (model) {
        if (isGPUmodel) {
          const manager = new SessionManager();
          const loadResult = await manager.loadModel(
              gpuModelsHashTable[modelName],
              () => {
                  setLoading(false);
                  setLoaded(true);
                  setModel(modelName);

                  saveModelToIndexedDB(modelName, true);  // Save a boolean to indicate that the model is saved
                  setSavedModels(prev => ({ ...prev, [modelName]: true }));
              },
              (p) => setProgress(Math.round(p))
          );
          if (loadResult.isErr) {
              console.error(loadResult.error.message);
          } else {
              setDownloading(null);
              processor?.setModel(modelName, loadResult.value);
              success();
          }
        } else {
          processor?.setModel(modelName, model);
          saveModelToIndexedDB(modelName, model);

          setLoading(false);
          setLoaded(true);
          setModel(modelName);
          success();
        }
      } else {
          const confirmed = window.confirm(
            'Estàs a punt de descarregar ' + (modelSizes?.[modelName] || '?') + ' MB de dades.\n' +
            'Les dades del model es desaran en la memòria del navegador per a ús futur i no hauràs de tornar a descarregar-lo.\n\n' +
            'Prem OK per continuar.'
          );

          if (!confirmed) return;

          setDownloading(modelName);

          if (isGPUmodel) {
            const manager = new SessionManager();
            const loadResult = await manager.loadModel(
                gpuModelsHashTable[modelName],
                () => {
                    setLoading(false);
                    setLoaded(true);
                    setModel(modelName);

                    saveModelToIndexedDB(modelName, true);  // Save a boolean to indicate that the model is saved
                    setSavedModels(prev => ({ ...prev, [modelName]: true }));
                },
                (p) => setProgress(Math.round(p))
            );
            if (loadResult.isErr) {
                console.error(loadResult.error.message);
            } else {
                setDownloading(null);
                processor?.setModel(modelName, loadResult.value);
                success();
            }
          } else {
            fetchModel(modelName, setProgress)
                .then(model => {
                      processor?.setModel(modelName, model);
                      saveModelToIndexedDB(modelName, model);
                      setSavedModels(prev => ({ ...prev, [modelName]: true }));
                      
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

          // Check if 'medium-gpu' model is already in localforage
          if (key.includes('medium-gpu')) {
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
        <button className={(model === 'base' ? 'selected' : '') + (downloading === 'base' ? 'downloading' : '')} onClick={() => loadModel('base')}>Transcripció ràpida{ !savedModels['base'] && <> (57 MB)</> }</button>
        {/* <button className={(model === 'small' ? 'selected' : '') + (downloading === 'small' ? 'downloading' : '')} onClick={() => loadModel('small')}>Transcripció ràpida{ !savedModels['small'] && <> (190 MB)</> }</button> */}
        { !processor?.isGPUEnabled && <button className={(model === 'medium' ? 'selected' : '') + (downloading === 'medium' ? 'downloading' : '')} onClick={() => loadModel('medium')}>Transcripció de qualitat{ !savedModels['medium'] && <> (514 MB)</> }</button> }
        { processor?.isGPUEnabled && <button className={(model === 'medium-gpu' ? 'selected' : '') + (downloading === 'medium-gpu' ? 'downloading' : '')} onClick={() => loadModel('medium-gpu')}>🔥 Transcripció de qualitat{ !savedModels['medium-gpu'] && <> (774 MB)</> }</button> }
        
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