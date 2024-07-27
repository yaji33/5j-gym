import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from "react-icons/io5";
import maleIcon from '../assets/male-2.png';
import femaleIcon from '../assets/female-2.png';
import otherIcon from '../assets/other.png';
import '../pages/customer.css';
import { calculateStatus, formatTime } from '../pages/customer.jsx';
import axios from 'axios';
import CustomerLogHistory from './CustomerLogHistory.js';



const Subscription = ({ onSubscriptionChange, onSubscriptionTypeChange, initialType, initialQuantity }) => {
  const [subscriptionType, setSubscriptionType] = useState(initialType || '');
  const [quantity, setQuantity] = useState(initialQuantity || 1);

  const handleSubscriptionChange = (event) => {
    const selectedSubscription = event.target.value;
    setSubscriptionType(selectedSubscription);
    onSubscriptionTypeChange(selectedSubscription);
    updateCharge(selectedSubscription, quantity);
  };

  const handleQuantityChange = (event) => {
    const newQuantity = Number(event.target.value);
    setQuantity(newQuantity);
    updateCharge(subscriptionType, newQuantity);
  };

  const updateCharge = (subscription, quantity) => {
    let charge;
    switch (subscription) {
      case 'basic':
        charge = 50;
        break;
      case 'premium':
        charge = 200;
        break;
      case 'vip-monthly':
        charge = 400;
        break;
      case 'vip-yearly':
        charge = 4000;
        break;
      default:
        charge = 0;
    }
    const totalCharge = charge * quantity;
    onSubscriptionChange(totalCharge);
  };

  useEffect(() => {
    updateCharge(subscriptionType, quantity);
  }, [subscriptionType, quantity]);

  return (
    <div className="subscription">
      <select onChange={handleSubscriptionChange} value={subscriptionType}>
        <option value="" disabled>Subscription</option>
        <option value="basic">Daily</option>
        <option value="premium">Weekly</option>
        <option value="vip-monthly">Monthly</option>
        <option value="vip-yearly">Yearly</option>
      </select>
      <input type="number" min="1" value={quantity} onChange={handleQuantityChange} />
    </div>
  );
};

const CustomerDetailModal = ({ show, onClose, customer, onRenew }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [charge, setCharge] = useState(customer.charge || 0);
  const [instructor, setInstructor] = useState(customer.instructor || '');
  const [subscriptionType, setSubscriptionType] = useState(customer.subscription || '');
  const [logHistory, setLogHistory] = useState([]);

  useEffect(() => {
    if (show && customer) {
      // Fetch log history when modal is shown and customer is available
      const fetchLogHistory = async () => {
        try {
          const response = await axios.get(`http://localhost:8800/customer/${customer.id}/log-history`);
          console.log('Fetched log history:', response.data); // Log fetched data
          setLogHistory(response.data);
        } catch (error) {
          console.error('Error fetching log history:', error);
        }
      };
      fetchLogHistory();
    }
  }, [show, customer]);

  useEffect(() => {
    if (activeTab === 'renew') {
      setCharge(customer.charge);
      setInstructor(customer.instructor);
      setSubscriptionType(customer.subscription);
    }
  }, [activeTab, customer]);

  if (!show) {
    return null;
  }

  const genderIcon = customer.gender === 'male' ? maleIcon : customer.gender === 'female' ? femaleIcon : otherIcon;
  const { status, remainingTime } = calculateStatus(customer);

  const handleSubscriptionChange = (newCharge) => {
    setCharge(newCharge);
  };

  const handleSubscriptionTypeChange = (type) => {
    setSubscriptionType(type);
  };

  const handleRenew = async () => {
    const updatedCustomer = { 
      ...customer, 
      instructor, 
      subscription: subscriptionType, 
      charge, 
      date_added: new Date().toISOString() 
    };

    try {
      await axios.put(`http://localhost:8800/customer/${customer.id}/renew`, updatedCustomer);

      // Log the renewal event
      await axios.post(`http://localhost:8800/customer/${customer.id}/log-history`, {
        subscription: subscriptionType,
        charge,
        instructor,
        date_added: new Date().toISOString(),
        date_ended: null // Set to null for ongoing subscriptions
      });

      // Refresh log history
      const response = await axios.get(`http://localhost:8800/customer/${customer.id}/log-history`);
      console.log('Updated log history:', response.data); // Log updated data
      setLogHistory(response.data);

      onRenew(updatedCustomer);
    } catch (error) {
      console.error('Error renewing subscription:', error);
    }
  };

  return (
    <div className="modal-overlay-details">
      <div className="modal-content-details">
        <div className="title-container-customer-details">
          <h2>Customer Details</h2>
        </div>
        <IoCloseSharp className="close-icon" onClick={onClose} />
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          {status === 'expired' && (
            <button 
              className={`tab-button ${activeTab === 'renew' ? 'active' : ''}`} 
              onClick={() => setActiveTab('renew')}
            >
              Renew
            </button>
          )}
          <button 
            className={`tab-button ${activeTab === 'log' ? 'active' : ''}`} 
            onClick={() => setActiveTab('log')}
          >
            Customer Log
          </button>
        </div>
        <div className="modal-body-details">
          {activeTab === 'profile' && (
            <div className="avatar-section">
              <img src={genderIcon} alt="Gender Icon" className="avatar" />
              <div className="customer-info">
                <div className="detail-row">
                  <div className="detail-item">
                    <label className="detail-label">First Name:</label>
                    <div className="detail-value">{customer.firstName}</div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Last Name:</label>
                    <div className="detail-value">{customer.lastName}</div>
                  </div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Address:</label>
                  <div className="detail-value">{customer.address}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Birthdate:</label>
                  <div className="detail-value">{customer.birthdate}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Instructor:</label>
                  <div className="detail-value">{customer.instructor}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <label className="detail-label">Subscription:</label>
                    <div className="detail-value">{customer.subscription}</div>
                  </div>
                  <div className="detail-item">
                    <label className="detail-label">Charge:</label>
                    <div className="detail-value">${customer.charge}</div>
                  </div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Date Added:</label>
                  <div className="detail-value">{new Date(customer.date_added).toLocaleDateString()}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Status:</label>
                  <div className="detail-value">{status}</div>
                </div>
                <div className="detail-item">
                  <label className="detail-label">Remaining Time:</label>
                  <div className="detail-value">{formatTime(remainingTime)}</div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'renew' && (
            <div className="renew-section">
              <h3>Renew Subscription</h3>
              <select value={instructor} onChange={(e) => setInstructor(e.target.value)}>
                <option value="" disabled>Instructor</option>
                <option value="instructor1">Instructor 1</option>
                <option value="instructor2">Instructor 2</option>
                <option value="instructor3">Instructor 3</option>
              </select>
              <Subscription 
                onSubscriptionChange={handleSubscriptionChange} 
                onSubscriptionTypeChange={handleSubscriptionTypeChange} 
                initialType={subscriptionType} 
                initialQuantity={1}
              />
              <div className="charge-container-renew">
                <h4>Charge:</h4>
                <h4>${charge}</h4>
              </div>
              <button className="renew-button" onClick={handleRenew}>Renew Subscription</button>
            </div>
          )}
          {activeTab === 'log' && (
            <CustomerLogHistory logHistory={logHistory} /> // Pass logHistory here
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;