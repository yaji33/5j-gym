import React from 'react';
import PropTypes from 'prop-types';

const CustomerLogHistory = ({ logHistory }) => {
  if (!Array.isArray(logHistory)) {
    console.error('Invalid logHistory prop:', logHistory);
    return <div>Error: Invalid log history data.</div>;
  }

  return (
    <div className="log-section">
      <h3>Customer Log History</h3>
      <div className="log-section-table-container">
        <table className="log-section-table">
          <thead>
            <tr>
              <th>Subscription</th>
              <th>Charge</th>
              <th>Instructor</th>
              <th>Date Added</th>
              <th>Date Ended</th>
            </tr>
          </thead>
          <tbody>
            {logHistory.length > 0 ? (
              logHistory.map((log, index) => (
                <tr key={index}>
                  <td>{log.subscription}</td>
                  <td>{`$${log.charge.toFixed(2)}`}</td>
                  <td>{log.instructor}</td>
                  <td>{new Date(log.date_added).toLocaleDateString()}</td>
                  <td>{log.date_ended ? new Date(log.date_ended).toLocaleDateString() : 'Ongoing'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No log history available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

CustomerLogHistory.propTypes = {
  logHistory: PropTypes.arrayOf(
    PropTypes.shape({
      subscription: PropTypes.string.isRequired,
      charge: PropTypes.number.isRequired,
      instructor: PropTypes.string.isRequired,
      date_added: PropTypes.string.isRequired,
      date_ended: PropTypes.string,
    })
  ).isRequired,
};

export default CustomerLogHistory;
