import React, { useState, useEffect } from 'react';
import { loadModelFromIndexedDB, saveModelToIndexedDB } from '../utils/indexedDB';
import { fetchModel } from '../utils/models';

const ModelLoader = ({ processor, success, error }) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [model, setModel] = useState(null);

  const loadModel = async (modelName) => {
    try {
      const model = await loadModelFromIndexedDB();

      if (model) {
            processor.setModel(model);
            saveModelToIndexedDB(model);

          setLoading(false);
          setLoaded(true);
          setModel(modelName);
            success();
      } else {
          fetchModel(modelName)
              .then(model => {
                    processor.setModel(model);
                    saveModelToIndexedDB(model);

                    setLoading(false);
                    setLoaded(true);
                    setModel(modelName);
                    success();
              })
              .catch(err => {
                    console.log(err);
                    setLoading(false);
                    error();
                });
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      error();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!loaded) {
    return (
        <div>
            <button onClick={() => loadModel('tiny')}>Load Tiny Model</button>
        </div>
    );
  }

  return (
    <div>
      <div>Model: {model}</div>
      <button onClick={() => loadModel('tiny')}>Load Tiny Model</button>
    </div>
  );
}

export default ModelLoader;