/**
 PatientSelector.js - Patient Selection Dropdown Component
 
 A simple dropdown component that allows users to select from available patients.
 Displays patient IDs in a formatted list and handles selection changes.
 Used in the main app header for switching between different patient datasets.
 */

import React from 'react';

// Styles
const containerStyle = {
  margin: 24
};

const labelStyle = {
  fontWeight: 'bold',
  marginRight: 8
};

const selectStyle = {
  fontSize: 18,
  padding: '6px 12px'
};

const PatientSelector = ({ patients, value, onChange }) => (
  <div style={containerStyle}>
    <label htmlFor="patient-select" style={labelStyle}>
      Patient ID #:
    </label>
    <select
      id="patient-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={selectStyle}
    >
      <option value="">-- Select Patient --</option>
      {patients.map(pid => (
        <option key={pid} value={pid}>{pid}</option>
      ))}
    </select>
  </div>
);

export default PatientSelector;
