import React, { useState, useEffect } from 'react';
import styles from './MatchCard.module.css'; // Reusing existing styles
import { predictionsApi } from '../services/api';

const MatchPrediction = ({ match, season, eventCode }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!match || !season || !eventCode) return;
      
      setLoading(true);
      try {
        // Ensure match number is in the correct format for the FTC Scout API
        const matchNumber = match.number.toString();
        const predictionData = await predictionsApi.getMatchPrediction(season, eventCode, matchNumber);
        setPrediction(predictionData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching match prediction:', err);
        setError(err.message || 'Failed to load prediction data');
        setLoading(false);
      }
    };
    
    fetchPrediction();
  }, [match, season, eventCode]);

  if (loading) {
    return <div className={styles.loadingState}>Loading prediction...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>;
  }

  if (!prediction) {
    return <div className={styles.noPrediction}>No prediction available</div>;
  }

  // Handle different API response structures
  // Check if prediction has the expected properties
  const redWinProbability = prediction.redWinProbability || prediction.red_win_probability || 0.5;
  const winProbability = redWinProbability * 100;
  const isRedFavored = winProbability > 50;

  return (
    <div className={styles.predictionContainer}>
      <h4>Match Prediction</h4>
      
      <div className={styles.predictionDetails}>
        <div className={styles.probabilityBar}>
          <div 
            className={styles.redProbability}
            style={{ width: `${winProbability}%` }}
          ></div>
          <div 
            className={styles.blueProbability}
            style={{ width: `${100 - winProbability}%` }}
          ></div>
        </div>
        
        <div className={styles.predictionText}>
          <span className={isRedFavored ? styles.redFavored : styles.blueFavored}>
            {isRedFavored ? 'Red' : 'Blue'} alliance favored to win 
            ({isRedFavored ? winProbability.toFixed(1) : (100 - winProbability).toFixed(1)}%)
          </span>
        </div>
        
        <div className={styles.predictedScores}>
          <div className={styles.redScore}>
            <span>Red:</span> {prediction.predictedRedScore.toFixed(1)}
          </div>
          <div className={styles.blueScore}>
            <span>Blue:</span> {prediction.predictedBlueScore.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchPrediction;