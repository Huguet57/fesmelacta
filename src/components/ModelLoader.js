import React, { useState, useEffect } from 'react';
import { loadModelFromIndexedDB, saveModelToIndexedDB } from '../utils/indexedDB';
import { fetchModel, modelSizes } from '../utils/models';
import ProgressBar from './model/ProgressBar';

const ModelLoader = ({ processor, success, error, state }) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [model, setModel] = useState(null);
  const [progress, setProgress] = useState(null);

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

          fetchModel(modelName, setProgress)
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

      { (0 < progress && progress < 100) && <ProgressBar progress={progress} /> }
    </div>
  );
}

export default ModelLoader;