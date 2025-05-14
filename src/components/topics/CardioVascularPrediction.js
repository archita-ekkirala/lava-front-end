import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Tabs, Tab, Button, Paper } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { CalculateMetrics } from '../metrics/CalculateMetrics';
import CKDPredictionCsvFromFhir from '../CKDPredictionCsvFromFhir';
import { CalculateSubgroupMetrics } from '../metrics/CalculateSubgroupMetrics';
import SubgroupBarChart from '../charts/SubgroupBarChart';
import MetricsSection from '../charts/MetricsSection';
import DistributionCharts from '../charts/DistributionCharts';
import { CalculateMetricsForScore } from '../metrics/CalculateMetricsForScore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const cvd_csv =  [
  ['Patient_ID', 'Prediction_Timestamp', 'Birthdate', 'Age', 'Gender', 'Race', 'Total_Cholesterol', 'HDL_Cholesterol', 'Systolic_Blood_Pressure', 'Diabetes_Status', 'Current_Smoking_Status', 'Hypertension_Treatment_Status', 'ASCVD_Actual_Outcome', 'TenYearScore', 'LifetimeRisk', 'LowestTenYear', 'LowestLifetime', 'PotentialRisk'],
 ['P001', '2024-03-15', '1974-10-08', '49', 'Female', 'White', '214.5', '92.4', '91', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.7', '50', '0.0', '8', '0.7'],
 ['P001', '2024-04-14', '1974-10-08', '49', 'Female', 'White', '218.4', '91.5', '92', 'Diabetic', 'Smoker', 'On Treatment', '1', '1.0', '50', '0.0', '8', '1.0'],
 ['P001', '2024-05-14', '1974-10-08', '49', 'Female', 'White', '222.1', '90.7', '92', 'Diabetic', 'Smoker', 'On Treatment', '1', '1.4', '50', '0.0', '8', '1.4'],
 ['P001', '2024-06-13', '1974-10-08', '49', 'Female', 'White', '226.3', '89.7', '92', 'Diabetic', 'Smoker', 'On Treatment', '1', '2.1', '50', '0.0', '8', '2.1'],
 ['P001', '2024-07-13', '1974-10-08', '49', 'Female', 'White', '231.4', '88.0', '93', 'Diabetic', 'Smoker', 'On Treatment', '1', '3.7', '50', '0.0', '8', '3.7'],
 ['P002', '2024-03-15', '1981-03-27', '42', 'Female', 'White', '207.6', '46.8', '177', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P002', '2024-04-14', '1981-03-27', '42', 'Female', 'White', '210.9', '45.0', '176', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P002', '2024-05-14', '1981-03-27', '42', 'Female', 'White', '214.0', '42.6', '177', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P002', '2024-06-13', '1981-03-27', '42', 'Female', 'White', '217.9', '41.8', '176', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P002', '2024-07-13', '1981-03-27', '42', 'Female', 'White', '224.3', '40.0', '176', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P003', '2024-03-15', '1976-10-21', '47', 'Female', 'White', '197.0', '48.4', '151', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P003', '2024-04-14 08:45 AM', '1976-10-21', '47', 'Female', 'White', '196.4', '49.7', '150', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '99.9', '50', '0.0', '8', '99.9'],
 ['P003', '2024-05-14 08:45 AM', '1976-10-21', '47', 'Female', 'White', '194.2', '50.5', '151', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '99.1', '50', '0.0', '8', '99.1'],
 ['P003', '2024-06-13 08:45 AM', '1976-10-21', '47', 'Female', 'White', '192.1', '52.0', '148', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '93.6', '50', '0.0', '8', '93.6'],
 ['P003', '2024-07-13 08:45 AM', '1976-10-21', '47', 'Female', 'White', '187.8', '52.6', '148', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '82.4', '50', '0.0', '8', '82.4'],
 ['P004', '2024-03-15 09:00 AM', '1979-01-04', '45', 'Male', 'White', '209.4', '44.9', '108', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P004', '2024-04-14 09:00 AM', '1979-01-04', '45', 'Male', 'White', '209.2', '45.2', '107', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P004', '2024-05-14 09:00 AM', '1979-01-04', '45', 'Male', 'White', '210.0', '44.8', '107', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P004', '2024-06-13 09:00 AM', '1979-01-04', '45', 'Male', 'White', '212.0', '44.5', '106', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P004', '2024-07-13 09:00 AM', '1979-01-04', '45', 'Male', 'White', '210.4', '44.8', '105', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P005', '2024-03-15 09:15 AM', '1977-08-28', '46', 'Male', 'White', '277.2', '69.1', '162', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P005', '2024-04-14 09:15 AM', '1977-08-28', '46', 'Male', 'White', '277.0', '69.4', '163', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P005', '2024-05-14 09:15 AM', '1977-08-28', '46', 'Male', 'White', '276.6', '69.3', '162', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P005', '2024-06-13 09:15 AM', '1977-08-28', '46', 'Male', 'White', '275.1', '69.0', '162', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P005', '2024-07-13 09:15 AM', '1977-08-28', '46', 'Male', 'White', '275.2', '68.1', '161', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P006', '2024-03-15 09:30 AM', '1979-11-07', '44', 'Female', 'White', '197.1', '95.7', '103', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.1', '50', '0.0', '8', '0.1'],
 ['P006', '2024-04-14 09:30 AM', '1979-11-07', '44', 'Female', 'White', '200.8', '94.3', '104', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.1', '50', '0.0', '8', '0.1'],
 ['P006', '2024-05-14 09:30 AM', '1979-11-07', '44', 'Female', 'White', '204.0', '92.5', '105', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.2', '50', '0.0', '8', '0.2'],
 ['P006', '2024-06-13 09:30 AM', '1979-11-07', '44', 'Female', 'White', '205.9', '92.3', '105', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.2', '50', '0.0', '8', '0.2'],
 ['P006', '2024-07-13 09:30 AM', '1979-11-07', '44', 'Female', 'White', '208.9', '91.5', '106', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.2', '50', '0.0', '8', '0.2'],
 ['P007', '2024-03-15 09:45 AM', '1967-07-16', '56', 'Female', 'African American', '267.5', '84.3', '131', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P007', '2024-04-14 09:45 AM', '1967-07-16', '56', 'Female', 'African American', '269.1', '83.3', '132', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P007', '2024-05-14 09:45 AM', '1967-07-16', '56', 'Female', 'African American', '273.3', '81.6', '135', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P007', '2024-06-13 09:45 AM', '1967-07-16', '56', 'Female', 'African American', '274.7', '80.8', '136', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P007', '2024-07-13 09:45 AM', '1967-07-16', '56', 'Female', 'African American', '279.1', '79.4', '138', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P008', '2024-03-15 10:00 AM', '1983-01-05', '41', 'Female', 'African American', '187.0', '63.6', '101', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P008', '2024-04-14 10:00 AM', '1983-01-05', '41', 'Female', 'African American', '184.6', '65.6', '99', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P008', '2024-05-14 10:00 AM', '1983-01-05', '41', 'Female', 'African American', '181.8', '65.9', '97', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P008', '2024-06-13 10:00 AM', '1983-01-05', '41', 'Female', 'African American', '178.8', '67.6', '97', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '8', '0.0', '8', '0.0'],
 ['P008', '2024-07-13 10:00 AM', '1983-01-05', '41', 'Female', 'African American', '173.2', '68.9', '96', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '8', '0.0', '8', '0.0'],
 ['P009', '2024-03-15 10:15 AM', '1977-07-09', '46', 'Male', 'African American', '192.0', '96.3', '167', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P009', '2024-04-14 10:15 AM', '1977-07-09', '46', 'Male', 'African American', '193.2', '94.6', '169', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P009', '2024-05-14 10:15 AM', '1977-07-09', '46', 'Male', 'African American', '193.8', '93.2', '168', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P009', '2024-06-13 10:15 AM', '1977-07-09', '46', 'Male', 'African American', '195.7', '93.4', '170', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P009', '2024-07-13 10:15 AM', '1977-07-09', '46', 'Male', 'African American', '197.8', '92.1', '171', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P010', '2024-03-15 10:30 AM', '1977-04-02', '46', 'Female', 'African American', '178.5', '92.1', '95', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P010', '2024-04-14 10:30 AM', '1977-04-02', '46', 'Female', 'African American', '173.7', '93.3', '94', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P010', '2024-05-14 10:30 AM', '1977-04-02', '46', 'Female', 'African American', '171.0', '94.7', '92', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P010', '2024-06-13 10:30 AM', '1977-04-02', '46', 'Female', 'African American', '169.9', '95.0', '90', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P010', '2024-07-13 10:30 AM', '1977-04-02', '46', 'Female', 'African American', '167.3', '97.4', '91', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P011', '2024-03-15 10:45 AM', '1979-01-06', '45', 'Female', 'African American', '191.4', '76.5', '129', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P011', '2024-04-14 10:45 AM', '1979-01-06', '45', 'Female', 'African American', '190.4', '76.1', '130', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P011', '2024-05-14 10:45 AM', '1979-01-06', '45', 'Female', 'African American', '189.6', '75.3', '131', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P011', '2024-06-13 10:45 AM', '1979-01-06', '45', 'Female', 'African American', '188.2', '74.6', '130', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P011', '2024-07-13 10:45 AM', '1979-01-06', '45', 'Female', 'African American', '188.7', '74.6', '130', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P012', '2024-03-15 11:00 AM', '1983-05-23', '40', 'Male', 'White', '187.0', '54.5', '154', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P012', '2024-04-14 11:00 AM', '1983-05-23', '40', 'Male', 'White', '186.4', '53.6', '155', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P012', '2024-05-14 11:00 AM', '1983-05-23', '40', 'Male', 'White', '186.4', '53.7', '155', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P012', '2024-06-13 11:00 AM', '1983-05-23', '40', 'Male', 'White', '187.8', '53.6', '156', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P012', '2024-07-13 11:00 AM', '1983-05-23', '40', 'Male', 'White', '185.9', '53.6', '155', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P013', '2024-03-15 11:15 AM', '1979-05-28', '44', 'Male', 'African American', '183.0', '83.6', '113', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P013', '2024-04-14 11:15 AM', '1979-05-28', '44', 'Male', 'African American', '185.6', '81.6', '115', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P013', '2024-05-14 11:15 AM', '1979-05-28', '44', 'Male', 'African American', '188.7', '80.6', '115', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P013', '2024-06-13 11:15 AM', '1979-05-28', '44', 'Male', 'African American', '190.7', '78.3', '114', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P013', '2024-07-13 11:15 AM', '1979-05-28', '44', 'Male', 'African American', '192.8', '78.0', '113', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P014', '2024-03-15 11:30 AM', '1973-02-16', '51', 'Male', 'African American', '260.8', '59.9', '142', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P014', '2024-04-14 11:30 AM', '1973-02-16', '51', 'Male', 'African American', '261.8', '60.6', '141', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P014', '2024-05-14 11:30 AM', '1973-02-16', '51', 'Male', 'African American', '263.4', '60.6', '140', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P014', '2024-06-13 11:30 AM', '1973-02-16', '51', 'Male', 'African American', '263.8', '60.0', '140', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P014', '2024-07-13 11:30 AM', '1973-02-16', '51', 'Male', 'African American', '262.0', '61.0', '140', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P015', '2024-03-15 11:45 AM', '1982-11-16', '41', 'Male', 'White', '195.2', '59.1', '161', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P015', '2024-04-14 11:45 AM', '1982-11-16', '41', 'Male', 'White', '194.8', '59.5', '161', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P015', '2024-05-14 11:45 AM', '1982-11-16', '41', 'Male', 'White', '195.1', '60.4', '160', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P015', '2024-06-13 11:45 AM', '1982-11-16', '41', 'Male', 'White', '196.0', '60.2', '161', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P015', '2024-07-13 11:45 AM', '1982-11-16', '41', 'Male', 'White', '196.3', '60.9', '160', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P016', '2024-03-15 12:00 PM', '1980-09-01', '43', 'Male', 'African American', '257.8', '94.9', '125', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P016', '2024-04-14 12:00 PM', '1980-09-01', '43', 'Male', 'African American', '256.9', '95.3', '126', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P016', '2024-05-14 12:00 PM', '1980-09-01', '43', 'Male', 'African American', '256.4', '95.7', '127', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P016', '2024-06-13 12:00 PM', '1980-09-01', '43', 'Male', 'African American', '258.4', '95.2', '127', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P016', '2024-07-13 12:00 PM', '1980-09-01', '43', 'Male', 'African American', '259.4', '95.8', '128', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P017', '2024-03-15 12:15 PM', '1967-07-31', '56', 'Female', 'White', '168.2', '71.9', '171', 'Diabetic', 'Smoker', 'On Treatment', '0', '2.5', '50', '0.0', '8', '2.5'],
 ['P017', '2024-04-14 12:15 PM', '1967-07-31', '56', 'Female', 'White', '167.7', '71.5', '171', 'Diabetic', 'Smoker', 'On Treatment', '0', '2.6', '50', '0.0', '8', '2.6'],
 ['P017', '2024-05-14 12:15 PM', '1967-07-31', '56', 'Female', 'White', '166.5', '70.9', '172', 'Diabetic', 'Smoker', 'On Treatment', '0', '2.7', '50', '0.0', '8', '2.7'],
 ['P017', '2024-06-13 12:15 PM', '1967-07-31', '56', 'Female', 'White', '165.6', '70.5', '171', 'Diabetic', 'Smoker', 'On Treatment', '0', '2.7', '50', '0.0', '8', '2.7'],
 ['P017', '2024-07-13 12:15 PM', '1967-07-31', '56', 'Female', 'White', '164.3', '71.2', '170', 'Diabetic', 'Smoker', 'On Treatment', '0', '2.1', '50', '0.0', '8', '2.1'],
 ['P018', '2024-03-15 12:30 PM', '1976-02-08', '48', 'Female', 'African American', '198.3', '99.0', '171', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P018', '2024-04-14 12:30 PM', '1976-02-08', '48', 'Female', 'African American', '195.5', '99.3', '171', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P018', '2024-05-14 12:30 PM', '1976-02-08', '48', 'Female', 'African American', '194.0', '99.3', '171', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P018', '2024-06-13 12:30 PM', '1976-02-08', '48', 'Female', 'African American', '191.1', '100.0', '172', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P018', '2024-07-13 12:30 PM', '1976-02-08', '48', 'Female', 'African American', '190.1', '100.0', '171', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P019', '2024-03-15 12:45 PM', '1982-09-10', '41', 'Male', 'African American', '248.4', '46.0', '138', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P019', '2024-04-14 12:45 PM', '1982-09-10', '41', 'Male', 'African American', '247.1', '46.2', '138', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P019', '2024-05-14 12:45 PM', '1982-09-10', '41', 'Male', 'African American', '247.6', '46.1', '139', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P019', '2024-06-13 12:45 PM', '1982-09-10', '41', 'Male', 'African American', '249.1', '47.1', '139', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P019', '2024-07-13 12:45 PM', '1982-09-10', '41', 'Male', 'African American', '249.7', '46.5', '139', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P020', '2024-03-15 01:00 PM', '1966-11-21', '57', 'Male', 'White', '279.9', '47.9', '179', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P020', '2024-04-14 01:00 PM', '1966-11-21', '57', 'Male', 'White', '280.0', '47.1', '179', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P020', '2024-05-14 01:00 PM', '1966-11-21', '57', 'Male', 'White', '280.0', '47.8', '179', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P020', '2024-06-13 01:00 PM', '1966-11-21', '57', 'Male', 'White', '280.0', '47.5', '178', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P020', '2024-07-13 01:00 PM', '1966-11-21', '57', 'Male', 'White', '280.0', '47.4', '179', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P021', '2024-03-15 01:15 PM', '1969-11-01', '54', 'Male', 'White', '270.5', '79.8', '108', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P021', '2024-04-14 01:15 PM', '1969-11-01', '54', 'Male', 'White', '266.8', '80.4', '107', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P021', '2024-05-14 01:15 PM', '1969-11-01', '54', 'Male', 'White', '261.8', '81.0', '105', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P021', '2024-06-13 01:15 PM', '1969-11-01', '54', 'Male', 'White', '260.0', '81.5', '104', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P021', '2024-07-13 01:15 PM', '1969-11-01', '54', 'Male', 'White', '256.9', '82.8', '101', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P022', '2024-03-15 01:30 PM', '1965-05-26', '58', 'Female', 'African American', '241.3', '87.2', '150', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P022', '2024-04-14 01:30 PM', '1965-05-26', '58', 'Female', 'African American', '240.2', '88.4', '150', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P022', '2024-05-14 01:30 PM', '1965-05-26', '58', 'Female', 'African American', '240.2', '88.9', '149', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P022', '2024-06-13 01:30 PM', '1965-05-26', '58', 'Female', 'African American', '237.2', '90.2', '148', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P022', '2024-07-13 01:30 PM', '1965-05-26', '58', 'Female', 'African American', '232.5', '90.4', '146', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P023', '2024-03-15 01:45 PM', '1968-12-21', '55', 'Female', 'African American', '208.5', '93.8', '163', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P023', '2024-04-14 01:45 PM', '1968-12-21', '55', 'Female', 'African American', '209.1', '92.7', '162', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P023', '2024-05-14 01:45 PM', '1968-12-21', '55', 'Female', 'African American', '215.3', '91.8', '163', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P023', '2024-06-13 01:45 PM', '1968-12-21', '55', 'Female', 'African American', '215.6', '90.2', '165', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P023', '2024-07-13 01:45 PM', '1968-12-21', '55', 'Female', 'African American', '218.8', '90.3', '166', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P024', '2024-03-15 02:00 PM', '1976-06-04', '47', 'Male', 'African American', '216.9', '55.9', '120', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P024', '2024-04-14 02:00 PM', '1976-06-04', '47', 'Male', 'African American', '217.3', '55.7', '119', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P024', '2024-05-14 02:00 PM', '1976-06-04', '47', 'Male', 'African American', '215.7', '54.7', '118', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P024', '2024-06-13 02:00 PM', '1976-06-04', '47', 'Male', 'African American', '216.1', '55.2', '117', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P024', '2024-07-13 02:00 PM', '1976-06-04', '47', 'Male', 'African American', '214.9', '54.8', '116', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P025', '2024-03-15 02:15 PM', '1975-10-18', '48', 'Male', 'African American', '190.7', '85.3', '111', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P025', '2024-04-14 02:15 PM', '1975-10-18', '48', 'Male', 'African American', '189.1', '84.4', '112', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P025', '2024-05-14 02:15 PM', '1975-10-18', '48', 'Male', 'African American', '190.6', '85.3', '111', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P025', '2024-06-13 02:15 PM', '1975-10-18', '48', 'Male', 'African American', '190.7', '86.0', '112', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P025', '2024-07-13 02:15 PM', '1975-10-18', '48', 'Male', 'African American', '191.0', '85.5', '113', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P026', '2024-03-15 02:30 PM', '1982-10-28', '41', 'Male', 'African American', '253.0', '49.4', '104', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P026', '2024-04-14 02:30 PM', '1982-10-28', '41', 'Male', 'African American', '253.0', '49.3', '105', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P026', '2024-05-14 02:30 PM', '1982-10-28', '41', 'Male', 'African American', '252.2', '50.2', '106', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P026', '2024-06-13 02:30 PM', '1982-10-28', '41', 'Male', 'African American', '250.7', '49.9', '105', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P026', '2024-07-13 02:30 PM', '1982-10-28', '41', 'Male', 'African American', '251.6', '50.3', '104', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P027', '2024-03-15 02:45 PM', '1971-01-04', '53', 'Male', 'White', '260.1', '56.7', '92', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P027', '2024-04-14 02:45 PM', '1971-01-04', '53', 'Male', 'White', '255.6', '58.0', '90', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P027', '2024-05-14 02:45 PM', '1971-01-04', '53', 'Male', 'White', '251.9', '58.6', '91', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P027', '2024-06-13 02:45 PM', '1971-01-04', '53', 'Male', 'White', '248.7', '58.9', '90', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P027', '2024-07-13 02:45 PM', '1971-01-04', '53', 'Male', 'White', '245.6', '61.2', '91', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P028', '2024-03-15 03:00 PM', '1979-10-18', '44', 'Male', 'African American', '205.2', '48.7', '135', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P028', '2024-04-14 03:00 PM', '1979-10-18', '44', 'Male', 'African American', '205.6', '47.8', '136', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P028', '2024-05-14 03:00 PM', '1979-10-18', '44', 'Male', 'African American', '206.6', '47.3', '135', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P028', '2024-06-13 03:00 PM', '1979-10-18', '44', 'Male', 'African American', '205.3', '47.3', '136', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P028', '2024-07-13 03:00 PM', '1979-10-18', '44', 'Male', 'African American', '206.9', '47.7', '137', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P029', '2024-03-15 03:15 PM', '1982-07-28', '41', 'Male', 'African American', '221.5', '76.9', '112', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P029', '2024-04-14 03:15 PM', '1982-07-28', '41', 'Male', 'African American', '217.9', '78.8', '110', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P029', '2024-05-14 03:15 PM', '1982-07-28', '41', 'Male', 'African American', '214.3', '80.0', '109', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P029', '2024-06-13 03:15 PM', '1982-07-28', '41', 'Male', 'African American', '209.5', '79.8', '106', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P029', '2024-07-13 03:15 PM', '1982-07-28', '41', 'Male', 'African American', '205.7', '81.5', '106', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P030', '2024-03-15 03:30 PM', '1980-10-20', '43', 'Male', 'African American', '244.4', '94.2', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P030', '2024-04-14 03:30 PM', '1980-10-20', '43', 'Male', 'African American', '245.3', '92.8', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P030', '2024-05-14 03:30 PM', '1980-10-20', '43', 'Male', 'African American', '248.8', '91.1', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P030', '2024-06-13 03:30 PM', '1980-10-20', '43', 'Male', 'African American', '250.8', '89.9', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P030', '2024-07-13 03:30 PM', '1980-10-20', '43', 'Male', 'African American', '254.1', '88.7', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P031', '2024-03-15 03:45 PM', '1981-11-30', '42', 'Male', 'White', '250.2', '95.0', '118', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P031', '2024-04-14 03:45 PM', '1981-11-30', '42', 'Male', 'White', '253.5', '93.6', '121', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P031', '2024-05-14 03:45 PM', '1981-11-30', '42', 'Male', 'White', '258.7', '92.4', '120', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P031', '2024-06-13 03:45 PM', '1981-11-30', '42', 'Male', 'White', '262.3', '90.8', '120', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P031', '2024-07-13 03:45 PM', '1981-11-30', '42', 'Male', 'White', '261.9', '91.2', '121', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P032', '2024-03-15 04:00 PM', '1966-01-17', '58', 'Female', 'White', '237.6', '42.1', '170', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P032', '2024-04-14 04:00 PM', '1966-01-17', '58', 'Female', 'White', '236.9', '44.7', '169', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P032', '2024-05-14 04:00 PM', '1966-01-17', '58', 'Female', 'White', '235.8', '46.7', '168', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P032', '2024-06-13 04:00 PM', '1966-01-17', '58', 'Female', 'White', '230.8', '47.6', '167', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P032', '2024-07-13 04:00 PM', '1966-01-17', '58', 'Female', 'White', '229.4', '48.8', '167', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P033', '2024-03-15 04:15 PM', '1970-11-16', '53', 'Female', 'African American', '212.2', '79.5', '138', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P033', '2024-04-14 04:15 PM', '1970-11-16', '53', 'Female', 'African American', '205.9', '80.1', '137', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P033', '2024-05-14 04:15 PM', '1970-11-16', '53', 'Female', 'African American', '204.7', '83.0', '136', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P033', '2024-06-13 04:15 PM', '1970-11-16', '53', 'Female', 'African American', '202.0', '84.8', '136', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P033', '2024-07-13 04:15 PM', '1970-11-16', '53', 'Female', 'African American', '200.8', '85.0', '136', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P034', '2024-03-15 04:30 PM', '1975-11-16', '48', 'Female', 'African American', '202.6', '100.0', '139', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P034', '2024-04-14 04:30 PM', '1975-11-16', '48', 'Female', 'African American', '196.8', '100.0', '140', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P034', '2024-05-14 04:30 PM', '1975-11-16', '48', 'Female', 'African American', '191.6', '99.6', '140', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P034', '2024-06-13 04:30 PM', '1975-11-16', '48', 'Female', 'African American', '188.1', '99.3', '139', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P034', '2024-07-13 04:30 PM', '1975-11-16', '48', 'Female', 'African American', '185.4', '99.9', '140', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P035', '2024-03-15 04:45 PM', '1981-03-30', '42', 'Female', 'White', '235.6', '46.4', '170', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P035', '2024-04-14 04:45 PM', '1981-03-30', '42', 'Female', 'White', '236.4', '44.5', '173', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P035', '2024-05-14 04:45 PM', '1981-03-30', '42', 'Female', 'White', '238.3', '42.1', '175', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P035', '2024-06-13 04:45 PM', '1981-03-30', '42', 'Female', 'White', '239.5', '40.8', '175', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P035', '2024-07-13 04:45 PM', '1981-03-30', '42', 'Female', 'White', '242.2', '40.7', '175', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P036', '2024-03-15 05:00 PM', '1971-12-08', '52', 'Male', 'White', '253.8', '40.0', '134', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P036', '2024-04-14 05:00 PM', '1971-12-08', '52', 'Male', 'White', '257.6', '40.4', '135', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P036', '2024-05-14 05:00 PM', '1971-12-08', '52', 'Male', 'White', '260.4', '40.0', '137', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P036', '2024-06-13 05:00 PM', '1971-12-08', '52', 'Male', 'White', '262.6', '40.0', '140', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P036', '2024-07-13 05:00 PM', '1971-12-08', '52', 'Male', 'White', '265.5', '40.0', '141', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P037', '2024-03-15 05:15 PM', '1978-11-15', '45', 'Male', 'White', '237.2', '94.3', '105', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P037', '2024-04-14 05:15 PM', '1978-11-15', '45', 'Male', 'White', '235.8', '95.0', '106', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P037', '2024-05-14 05:15 PM', '1978-11-15', '45', 'Male', 'White', '235.5', '94.5', '105', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P037', '2024-06-13 05:15 PM', '1978-11-15', '45', 'Male', 'White', '235.8', '94.3', '105', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P037', '2024-07-13 05:15 PM', '1978-11-15', '45', 'Male', 'White', '234.8', '94.6', '104', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P038', '2024-03-15 05:30 PM', '1983-01-01', '41', 'Female', 'African American', '241.5', '56.8', '102', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P038', '2024-04-14 05:30 PM', '1983-01-01', '41', 'Female', 'African American', '244.2', '55.7', '104', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P038', '2024-05-14 05:30 PM', '1983-01-01', '41', 'Female', 'African American', '247.2', '53.7', '103', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P038', '2024-06-13 05:30 PM', '1983-01-01', '41', 'Female', 'African American', '252.1', '52.7', '104', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P038', '2024-07-13 05:30 PM', '1983-01-01', '41', 'Female', 'African American', '257.5', '50.5', '107', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P039', '2024-03-15 05:45 PM', '1977-06-16', '46', 'Male', 'African American', '261.7', '59.8', '101', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P039', '2024-04-14 05:45 PM', '1977-06-16', '46', 'Male', 'African American', '265.7', '59.8', '102', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P039', '2024-05-14 05:45 PM', '1977-06-16', '46', 'Male', 'African American', '270.5', '58.1', '103', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P039', '2024-06-13 05:45 PM', '1977-06-16', '46', 'Male', 'African American', '276.1', '55.8', '104', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P039', '2024-07-13 05:45 PM', '1977-06-16', '46', 'Male', 'African American', '277.6', '54.5', '107', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P040', '2024-03-15 06:00 PM', '1968-04-29', '55', 'Male', 'White', '201.7', '44.9', '175', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P040', '2024-04-14 06:00 PM', '1968-04-29', '55', 'Male', 'White', '199.2', '47.6', '172', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P040', '2024-05-14 06:00 PM', '1968-04-29', '55', 'Male', 'White', '194.1', '48.6', '171', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P040', '2024-06-13 06:00 PM', '1968-04-29', '55', 'Male', 'White', '192.1', '50.2', '168', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P040', '2024-07-13 06:00 PM', '1968-04-29', '55', 'Male', 'White', '190.6', '52.2', '168', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P041', '2024-03-15 06:15 PM', '1967-04-26', '56', 'Male', 'African American', '195.4', '85.4', '171', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P041', '2024-04-14 06:15 PM', '1967-04-26', '56', 'Male', 'African American', '193.4', '86.6', '169', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P041', '2024-05-14 06:15 PM', '1967-04-26', '56', 'Male', 'African American', '191.4', '87.9', '168', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P041', '2024-06-13 06:15 PM', '1967-04-26', '56', 'Male', 'African American', '188.4', '88.1', '169', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P041', '2024-07-13 06:15 PM', '1967-04-26', '56', 'Male', 'African American', '186.8', '89.4', '167', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P042', '2024-03-15 06:30 PM', '1972-11-29', '51', 'Female', 'White', '259.9', '73.2', '145', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '95.5', '39', '0.0', '8', '95.5'],
 ['P042', '2024-04-14 06:30 PM', '1972-11-29', '51', 'Female', 'White', '257.2', '75.4', '145', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '83.5', '39', '0.0', '8', '83.5'],
 ['P042', '2024-05-14 06:30 PM', '1972-11-29', '51', 'Female', 'White', '252.2', '75.8', '142', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '72.4', '39', '0.0', '8', '72.4'],
 ['P042', '2024-06-13 06:30 PM', '1972-11-29', '51', 'Female', 'White', '248.5', '77.9', '140', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '51.7', '39', '0.0', '8', '51.7'],
 ['P042', '2024-07-13 06:30 PM', '1972-11-29', '51', 'Female', 'White', '245.1', '79.3', '139', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '37.7', '39', '0.0', '8', '37.7'],
 ['P043', '2024-03-15 06:45 PM', '1973-08-14', '50', 'Female', 'White', '185.2', '81.7', '115', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.6', '39', '0.0', '8', '0.6'],
 ['P043', '2024-04-14 06:45 PM', '1973-08-14', '50', 'Female', 'White', '183.4', '81.5', '116', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.5', '39', '0.0', '8', '0.5'],
 ['P043', '2024-05-14 06:45 PM', '1973-08-14', '50', 'Female', 'White', '182.5', '81.0', '117', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.6', '39', '0.0', '8', '0.6'],
 ['P043', '2024-06-13 06:45 PM', '1973-08-14', '50', 'Female', 'White', '181.7', '81.5', '117', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.5', '39', '0.0', '8', '0.5'],
 ['P043', '2024-07-13 06:45 PM', '1973-08-14', '50', 'Female', 'White', '181.2', '82.1', '118', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.4', '39', '0.0', '8', '0.4'],
 ['P044', '2024-03-15 07:00 PM', '1979-05-30', '44', 'Male', 'White', '270.4', '89.5', '136', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P044', '2024-04-14 07:00 PM', '1979-05-30', '44', 'Male', 'White', '272.2', '89.3', '137', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P044', '2024-05-14 07:00 PM', '1979-05-30', '44', 'Male', 'White', '270.5', '89.1', '138', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P044', '2024-06-13 07:00 PM', '1979-05-30', '44', 'Male', 'White', '269.6', '88.5', '137', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P044', '2024-07-13 07:00 PM', '1979-05-30', '44', 'Male', 'White', '269.6', '88.0', '138', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P045', '2024-03-15 07:15 PM', '1974-12-23', '49', 'Male', 'White', '157.7', '76.8', '158', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P045', '2024-04-14 07:15 PM', '1974-12-23', '49', 'Male', 'White', '157.6', '76.1', '157', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P045', '2024-05-14 07:15 PM', '1974-12-23', '49', 'Male', 'White', '155.9', '76.2', '156', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P045', '2024-06-13 07:15 PM', '1974-12-23', '49', 'Male', 'White', '157.4', '75.7', '155', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P045', '2024-07-13 07:15 PM', '1974-12-23', '49', 'Male', 'White', '158.1', '76.1', '154', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P046', '2024-03-15 07:30 PM', '1970-05-25', '53', 'Male', 'White', '158.6', '85.7', '102', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P046', '2024-04-14 07:30 PM', '1970-05-25', '53', 'Male', 'White', '159.3', '85.8', '105', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P046', '2024-05-14 07:30 PM', '1970-05-25', '53', 'Male', 'White', '164.7', '83.9', '105', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P046', '2024-06-13 07:30 PM', '1970-05-25', '53', 'Male', 'White', '167.1', '82.3', '106', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P046', '2024-07-13 07:30 PM', '1970-05-25', '53', 'Male', 'White', '169.8', '80.2', '106', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P047', '2024-03-15 07:45 PM', '1969-01-04', '55', 'Female', 'White', '169.2', '85.4', '108', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.2', '50', '0.0', '8', '0.2'],
 ['P047', '2024-04-14 07:45 PM', '1969-01-04', '55', 'Female', 'White', '167.5', '85.4', '108', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.2', '50', '0.0', '8', '0.2'],
 ['P047', '2024-05-14 07:45 PM', '1969-01-04', '55', 'Female', 'White', '167.5', '85.5', '109', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.2', '50', '0.0', '8', '0.2'],
 ['P047', '2024-06-13 07:45 PM', '1969-01-04', '55', 'Female', 'White', '165.6', '86.1', '108', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.2', '50', '0.0', '8', '0.2'],
 ['P047', '2024-07-13 07:45 PM', '1969-01-04', '55', 'Female', 'White', '164.7', '85.9', '108', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.1', '50', '0.0', '8', '0.1'],
 ['P048', '2024-03-15 08:00 PM', '1972-02-03', '52', 'Male', 'White', '247.3', '81.3', '143', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P048', '2024-04-14 08:00 PM', '1972-02-03', '52', 'Male', 'White', '251.2', '79.5', '142', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P048', '2024-05-14 08:00 PM', '1972-02-03', '52', 'Male', 'White', '256.4', '78.6', '142', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P048', '2024-06-13 08:00 PM', '1972-02-03', '52', 'Male', 'White', '259.1', '77.6', '145', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P048', '2024-07-13 08:00 PM', '1972-02-03', '52', 'Male', 'White', '261.9', '77.1', '146', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P049', '2024-03-15 08:15 PM', '1966-01-23', '58', 'Female', 'White', '242.9', '77.7', '164', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '83.7', '50', '0.0', '8', '83.7'],
 ['P049', '2024-04-14 08:15 PM', '1966-01-23', '58', 'Female', 'White', '241.5', '78.9', '162', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '74.4', '50', '0.0', '8', '74.4'],
 ['P049', '2024-05-14 08:15 PM', '1966-01-23', '58', 'Female', 'White', '238.7', '80.6', '161', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '58.1', '50', '0.0', '8', '58.1'],
 ['P049', '2024-06-13 08:15 PM', '1966-01-23', '58', 'Female', 'White', '234.9', '82.7', '161', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '39.0', '50', '0.0', '8', '39.0'],
 ['P049', '2024-07-13 08:15 PM', '1966-01-23', '58', 'Female', 'White', '232.2', '83.8', '161', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '29.8', '50', '0.0', '8', '29.8'],
 ['P050', '2024-03-15 08:30 PM', '1973-03-27', '51', 'Male', 'White', '199.0', '48.0', '145', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P050', '2024-04-14 08:30 PM', '1973-03-27', '51', 'Male', 'White', '200.3', '46.9', '148', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P050', '2024-05-14 08:30 PM', '1973-03-27', '51', 'Male', 'White', '204.8', '46.3', '148', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P050', '2024-06-13 08:30 PM', '1973-03-27', '51', 'Male', 'White', '207.4', '43.6', '149', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P050', '2024-07-13 08:30 PM', '1973-03-27', '51', 'Male', 'White', '211.7', '42.7', '150', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P051', '2024-03-15 08:45 PM', '1969-01-12', '55', 'Female', 'African American', '236.8', '49.8', '161', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P051', '2024-04-14 08:45 PM', '1969-01-12', '55', 'Female', 'African American', '243.0', '49.1', '164', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P051', '2024-05-14 08:45 PM', '1969-01-12', '55', 'Female', 'African American', '243.7', '48.1', '166', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P051', '2024-06-13 08:45 PM', '1969-01-12', '55', 'Female', 'African American', '248.0', '48.2', '166', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P051', '2024-07-13 08:45 PM', '1969-01-12', '55', 'Female', 'African American', '253.5', '47.4', '165', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P052', '2024-03-15 09:00 PM', '1973-10-14', '50', 'Male', 'White', '220.6', '70.7', '99', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P052', '2024-04-14 09:00 PM', '1973-10-14', '50', 'Male', 'White', '224.0', '69.1', '99', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P052', '2024-05-14 09:00 PM', '1973-10-14', '50', 'Male', 'White', '225.7', '68.3', '101', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P052', '2024-06-13 09:00 PM', '1973-10-14', '50', 'Male', 'White', '230.5', '67.7', '101', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P052', '2024-07-13 09:00 PM', '1973-10-14', '50', 'Male', 'White', '235.7', '66.5', '103', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P053', '2024-03-15 09:15 PM', '1973-08-03', '50', 'Male', 'African American', '263.4', '83.5', '91', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P053', '2024-04-14 09:15 PM', '1973-08-03', '50', 'Male', 'African American', '262.6', '82.9', '91', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P053', '2024-05-14 09:15 PM', '1973-08-03', '50', 'Male', 'African American', '263.2', '82.3', '91', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P053', '2024-06-13 09:15 PM', '1973-08-03', '50', 'Male', 'African American', '263.0', '82.4', '92', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P053', '2024-07-13 09:15 PM', '1973-08-03', '50', 'Male', 'African American', '262.0', '81.8', '92', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P054', '2024-03-15 09:30 PM', '1978-08-13', '45', 'Female', 'White', '235.6', '82.0', '156', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '6.3', '50', '0.0', '8', '6.3'],
 ['P054', '2024-04-14 09:30 PM', '1978-08-13', '45', 'Female', 'White', '237.3', '82.0', '157', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '6.9', '50', '0.0', '8', '6.9'],
 ['P054', '2024-05-14 09:30 PM', '1978-08-13', '45', 'Female', 'White', '236.2', '81.5', '157', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '7.0', '50', '0.0', '8', '7.0'],
 ['P054', '2024-06-13 09:30 PM', '1978-08-13', '45', 'Female', 'White', '234.7', '81.9', '156', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '6.1', '50', '0.0', '8', '6.1'],
 ['P054', '2024-07-13 09:30 PM', '1978-08-13', '45', 'Female', 'White', '233.2', '82.3', '155', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '5.2', '50', '0.0', '8', '5.2'],
 ['P055', '2024-03-15 09:45 PM', '1969-11-26', '54', 'Female', 'White', '192.6', '80.6', '163', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '2.4', '39', '0.0', '8', '2.4'],
 ['P055', '2024-04-14 09:45 PM', '1969-11-26', '54', 'Female', 'White', '189.5', '81.3', '161', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '1.7', '39', '0.0', '8', '1.7'],
 ['P055', '2024-05-14 09:45 PM', '1969-11-26', '54', 'Female', 'White', '187.0', '82.3', '160', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '1.2', '39', '0.0', '8', '1.2'],
 ['P055', '2024-06-13 09:45 PM', '1969-11-26', '54', 'Female', 'White', '183.0', '84.2', '158', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.7', '39', '0.0', '8', '0.7'],
 ['P055', '2024-07-13 09:45 PM', '1969-11-26', '54', 'Female', 'White', '177.9', '84.8', '159', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.4', '39', '0.0', '8', '0.4'],
 ['P056', '2024-03-15 10:00 PM', '1973-09-10', '50', 'Female', 'White', '270.8', '77.8', '122', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '86.5', '50', '0.0', '8', '86.5'],
 ['P056', '2024-04-14 10:00 PM', '1973-09-10', '50', 'Female', 'White', '274.6', '77.0', '124', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '93.8', '50', '0.0', '8', '93.8'],
 ['P056', '2024-05-14 10:00 PM', '1973-09-10', '50', 'Female', 'White', '278.4', '75.0', '125', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '99.2', '50', '0.0', '8', '99.2'],
 ['P056', '2024-06-13 10:00 PM', '1973-09-10', '50', 'Female', 'White', '279.8', '74.2', '125', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '99.7', '50', '0.0', '8', '99.7'],
 ['P056', '2024-07-13 10:00 PM', '1973-09-10', '50', 'Female', 'White', '279.0', '72.9', '127', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '99.9', '50', '0.0', '8', '99.9'],
 ['P057', '2024-03-15 10:15 PM', '1970-02-01', '54', 'Male', 'White', '184.3', '42.5', '137', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '36', '100.0', '5', '0.0'],
 ['P057', '2024-04-14 10:15 PM', '1970-02-01', '54', 'Male', 'White', '183.9', '42.1', '137', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '36', '100.0', '5', '0.0'],
 ['P057', '2024-05-14 10:15 PM', '1970-02-01', '54', 'Male', 'White', '182.3', '41.1', '138', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '36', '100.0', '5', '0.0'],
 ['P057', '2024-06-13 10:15 PM', '1970-02-01', '54', 'Male', 'White', '184.1', '41.0', '139', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '36', '100.0', '5', '0.0'],
 ['P057', '2024-07-13 10:15 PM', '1970-02-01', '54', 'Male', 'White', '185.0', '40.8', '140', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '46', '100.0', '5', '0.0'],
 ['P058', '2024-03-15 10:30 PM', '1970-07-07', '53', 'Female', 'African American', '223.9', '82.5', '171', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P058', '2024-04-14 10:30 PM', '1970-07-07', '53', 'Female', 'African American', '222.3', '84.2', '169', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P058', '2024-05-14 10:30 PM', '1970-07-07', '53', 'Female', 'African American', '218.3', '85.8', '167', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P058', '2024-06-13 10:30 PM', '1970-07-07', '53', 'Female', 'African American', '215.4', '87.6', '168', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P058', '2024-07-13 10:30 PM', '1970-07-07', '53', 'Female', 'African American', '213.2', '89.3', '167', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P059', '2024-03-15 10:45 PM', '1972-07-25', '51', 'Female', 'White', '230.8', '56.5', '97', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P059', '2024-04-14 10:45 PM', '1972-07-25', '51', 'Female', 'White', '230.4', '58.4', '96', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P059', '2024-05-14 10:45 PM', '1972-07-25', '51', 'Female', 'White', '229.4', '58.2', '95', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P059', '2024-06-13 10:45 PM', '1972-07-25', '51', 'Female', 'White', '226.4', '59.3', '94', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P059', '2024-07-13 10:45 PM', '1972-07-25', '51', 'Female', 'White', '226.0', '60.4', '94', 'Diabetic', 'Smoker', 'On Treatment', '1', '99.8', '50', '0.0', '8', '99.8'],
 ['P060', '2024-03-15 11:00 PM', '1972-02-12', '52', 'Male', 'African American', '169.6', '72.4', '123', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P060', '2024-04-14 11:00 PM', '1972-02-12', '52', 'Male', 'African American', '168.0', '73.4', '121', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P060', '2024-05-14 11:00 PM', '1972-02-12', '52', 'Male', 'African American', '166.3', '74.2', '118', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P060', '2024-06-13 11:00 PM', '1972-02-12', '52', 'Male', 'African American', '164.2', '75.3', '118', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P060', '2024-07-13 11:00 PM', '1972-02-12', '52', 'Male', 'African American', '159.0', '76.2', '115', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P061', '2024-03-15 11:15 PM', '1983-11-04', '40', 'Female', 'African American', '247.8', '89.7', '151', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P061', '2024-04-14 11:15 PM', '1983-11-04', '40', 'Female', 'African American', '243.3', '91.1', '152', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P061', '2024-05-14 11:15 PM', '1983-11-04', '40', 'Female', 'African American', '242.0', '90.9', '152', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P061', '2024-06-13 11:15 PM', '1983-11-04', '40', 'Female', 'African American', '238.6', '92.5', '150', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P061', '2024-07-13 11:15 PM', '1983-11-04', '40', 'Female', 'African American', '234.4', '93.3', '150', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P062', '2024-03-15 11:30 PM', '1967-03-29', '57', 'Male', 'African American', '250.5', '41.4', '120', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P062', '2024-04-14 11:30 PM', '1967-03-29', '57', 'Male', 'African American', '250.9', '41.1', '120', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P062', '2024-05-14 11:30 PM', '1967-03-29', '57', 'Male', 'African American', '251.3', '40.0', '120', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P062', '2024-06-13 11:30 PM', '1967-03-29', '57', 'Male', 'African American', '253.3', '40.0', '121', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P062', '2024-07-13 11:30 PM', '1967-03-29', '57', 'Male', 'African American', '254.9', '40.6', '121', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P063', '2024-03-15 11:45 PM', '1969-04-14', '54', 'Female', 'African American', '173.5', '92.2', '131', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '27', '0.0', '8', '0.0'],
 ['P063', '2024-04-14 11:45 PM', '1969-04-14', '54', 'Female', 'African American', '177.3', '91.5', '130', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '27', '0.0', '8', '0.0'],
 ['P063', '2024-05-14 11:45 PM', '1969-04-14', '54', 'Female', 'African American', '180.3', '90.4', '132', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '27', '0.0', '8', '0.0'],
 ['P063', '2024-06-13 11:45 PM', '1969-04-14', '54', 'Female', 'African American', '184.6', '88.6', '133', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '27', '0.0', '8', '0.0'],
 ['P063', '2024-07-13 11:45 PM', '1969-04-14', '54', 'Female', 'African American', '187.7', '88.0', '133', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '27', '0.0', '8', '0.0'],
 ['P064', '2024-03-16 12:00 AM', '1982-08-16', '41', 'Male', 'African American', '203.1', '59.7', '115', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P064', '2024-04-15 12:00 AM', '1982-08-16', '41', 'Male', 'African American', '197.8', '61.0', '114', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P064', '2024-05-15 12:00 AM', '1982-08-16', '41', 'Male', 'African American', '197.4', '62.5', '112', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P064', '2024-06-14 12:00 AM', '1982-08-16', '41', 'Male', 'African American', '193.9', '62.7', '111', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P064', '2024-07-14 12:00 AM', '1982-08-16', '41', 'Male', 'African American', '191.9', '64.7', '111', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P065', '2024-03-16 12:15 AM', '1971-10-15', '52', 'Female', 'White', '244.4', '75.0', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '68.4', '50', '0.0', '8', '68.4'],
 ['P065', '2024-04-15 12:15 AM', '1971-10-15', '52', 'Female', 'White', '244.2', '75.7', '107', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '63.3', '50', '0.0', '8', '63.3'],
 ['P065', '2024-05-15 12:15 AM', '1971-10-15', '52', 'Female', 'White', '243.1', '75.7', '107', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '61.1', '50', '0.0', '8', '61.1'],
 ['P065', '2024-06-14 12:15 AM', '1971-10-15', '52', 'Female', 'White', '244.2', '76.5', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '58.1', '50', '0.0', '8', '58.1'],
 ['P065', '2024-07-14 12:15 AM', '1971-10-15', '52', 'Female', 'White', '243.4', '76.1', '107', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '59.1', '50', '0.0', '8', '59.1'],
 ['P066', '2024-03-16 12:30 AM', '1971-05-31', '52', 'Female', 'White', '233.0', '91.2', '154', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '4.1', '50', '0.0', '8', '4.1'],
 ['P066', '2024-04-15 12:30 AM', '1971-05-31', '52', 'Female', 'White', '228.6', '91.7', '154', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '3.0', '50', '0.0', '8', '3.0'],
 ['P066', '2024-05-15 12:30 AM', '1971-05-31', '52', 'Female', 'White', '226.9', '91.9', '154', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '2.6', '50', '0.0', '8', '2.6'],
 ['P066', '2024-06-14 12:30 AM', '1971-05-31', '52', 'Female', 'White', '225.2', '92.9', '152', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '2.1', '50', '0.0', '8', '2.1'],
 ['P066', '2024-07-14 12:30 AM', '1971-05-31', '52', 'Female', 'White', '221.3', '94.1', '153', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '1.4', '50', '0.0', '8', '1.4'],
 ['P067', '2024-03-16 12:45 AM', '1966-05-21', '57', 'Male', 'African American', '233.3', '49.9', '126', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P067', '2024-04-15 12:45 AM', '1966-05-21', '57', 'Male', 'African American', '236.5', '48.2', '126', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P067', '2024-05-15 12:45 AM', '1966-05-21', '57', 'Male', 'African American', '237.7', '48.5', '127', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P067', '2024-06-14 12:45 AM', '1966-05-21', '57', 'Male', 'African American', '238.1', '48.0', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P067', '2024-07-14 12:45 AM', '1966-05-21', '57', 'Male', 'African American', '239.3', '46.9', '129', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P068', '2024-03-16 01:00 AM', '1968-06-30', '55', 'Female', 'African American', '269.7', '48.6', '136', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P068', '2024-04-15 01:00 AM', '1968-06-30', '55', 'Female', 'African American', '266.5', '50.0', '135', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P068', '2024-05-15 01:00 AM', '1968-06-30', '55', 'Female', 'African American', '263.7', '50.7', '134', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P068', '2024-06-14 01:00 AM', '1968-06-30', '55', 'Female', 'African American', '261.8', '52.1', '134', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P068', '2024-07-14 01:00 AM', '1968-06-30', '55', 'Female', 'African American', '258.0', '54.0', '134', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P069', '2024-03-16 01:15 AM', '1971-01-05', '53', 'Male', 'White', '202.5', '82.8', '153', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P069', '2024-04-15 01:15 AM', '1971-01-05', '53', 'Male', 'White', '200.0', '84.7', '151', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P069', '2024-05-15 01:15 AM', '1971-01-05', '53', 'Male', 'White', '199.7', '85.5', '150', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P069', '2024-06-14 01:15 AM', '1971-01-05', '53', 'Male', 'White', '197.2', '86.6', '149', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P069', '2024-07-14 01:15 AM', '1971-01-05', '53', 'Male', 'White', '195.1', '87.5', '148', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P070', '2024-03-16 01:30 AM', '1968-04-20', '55', 'Male', 'White', '216.5', '66.8', '101', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P070', '2024-04-15 01:30 AM', '1968-04-20', '55', 'Male', 'White', '212.9', '68.7', '100', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P070', '2024-05-15 01:30 AM', '1968-04-20', '55', 'Male', 'White', '210.4', '70.8', '100', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P070', '2024-06-14 01:30 AM', '1968-04-20', '55', 'Male', 'White', '207.5', '71.8', '98', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P070', '2024-07-14 01:30 AM', '1968-04-20', '55', 'Male', 'White', '205.2', '72.8', '96', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P071', '2024-03-16 01:45 AM', '1970-02-27', '54', 'Male', 'African American', '161.5', '68.4', '112', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P071', '2024-04-15 01:45 AM', '1970-02-27', '54', 'Male', 'African American', '161.1', '68.9', '111', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P071', '2024-05-15 01:45 AM', '1970-02-27', '54', 'Male', 'African American', '162.0', '69.3', '112', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P071', '2024-06-14 01:45 AM', '1970-02-27', '54', 'Male', 'African American', '162.5', '69.1', '113', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P071', '2024-07-14 01:45 AM', '1970-02-27', '54', 'Male', 'African American', '161.6', '69.5', '114', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P072', '2024-03-16 02:00 AM', '1973-06-27', '50', 'Female', 'White', '196.5', '62.2', '143', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '41.9', '39', '0.0', '8', '41.9'],
 ['P072', '2024-04-15 02:00 AM', '1973-06-27', '50', 'Female', 'White', '194.2', '64.7', '143', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '23.8', '39', '0.0', '8', '23.8'],
 ['P072', '2024-05-15 02:00 AM', '1973-06-27', '50', 'Female', 'White', '190.5', '67.0', '141', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '12.2', '39', '0.0', '8', '12.2'],
 ['P072', '2024-06-14 02:00 AM', '1973-06-27', '50', 'Female', 'White', '188.4', '68.5', '139', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '8.0', '39', '0.0', '8', '8.0'],
 ['P072', '2024-07-14 02:00 AM', '1973-06-27', '50', 'Female', 'White', '182.9', '69.7', '139', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '4.3', '39', '0.0', '8', '4.3'],
 ['P073', '2024-03-16 02:15 AM', '1976-05-10', '47', 'Female', 'White', '155.9', '52.9', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '12.1', '39', '0.0', '8', '12.1'],
 ['P073', '2024-04-15 02:15 AM', '1976-05-10', '47', 'Female', 'White', '154.1', '52.8', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '10.7', '39', '0.0', '8', '10.7'],
 ['P073', '2024-05-15 02:15 AM', '1976-05-10', '47', 'Female', 'White', '152.3', '52.7', '107', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '9.4', '39', '0.0', '8', '9.4'],
 ['P073', '2024-06-14 02:15 AM', '1976-05-10', '47', 'Female', 'White', '152.4', '52.2', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '10.8', '39', '0.0', '8', '10.8'],
 ['P073', '2024-07-14 02:15 AM', '1976-05-10', '47', 'Female', 'White', '152.8', '52.3', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '10.9', '39', '0.0', '8', '10.9'],
 ['P074', '2024-03-16 02:30 AM', '1977-01-24', '47', 'Female', 'African American', '158.6', '44.3', '144', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P074', '2024-04-15 02:30 AM', '1977-01-24', '47', 'Female', 'African American', '159.8', '43.9', '146', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P074', '2024-05-15 02:30 AM', '1977-01-24', '47', 'Female', 'African American', '161.9', '43.5', '149', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P074', '2024-06-14 02:30 AM', '1977-01-24', '47', 'Female', 'African American', '167.1', '42.0', '149', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P074', '2024-07-14 02:30 AM', '1977-01-24', '47', 'Female', 'African American', '172.8', '40.7', '149', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P075', '2024-03-16 02:45 AM', '1972-08-16', '51', 'Male', 'African American', '158.3', '72.5', '157', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P075', '2024-04-15 02:45 AM', '1972-08-16', '51', 'Male', 'African American', '162.6', '71.7', '158', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P075', '2024-05-15 02:45 AM', '1972-08-16', '51', 'Male', 'African American', '166.2', '69.9', '161', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P075', '2024-06-14 02:45 AM', '1972-08-16', '51', 'Male', 'African American', '166.6', '69.2', '164', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P075', '2024-07-14 02:45 AM', '1972-08-16', '51', 'Male', 'African American', '171.9', '68.1', '165', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P076', '2024-03-16 03:00 AM', '1968-09-07', '55', 'Male', 'African American', '200.6', '44.0', '140', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P076', '2024-04-15 03:00 AM', '1968-09-07', '55', 'Male', 'African American', '195.7', '44.9', '139', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P076', '2024-05-15 03:00 AM', '1968-09-07', '55', 'Male', 'African American', '193.8', '46.9', '139', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P076', '2024-06-14 03:00 AM', '1968-09-07', '55', 'Male', 'African American', '193.1', '49.1', '136', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P076', '2024-07-14 03:00 AM', '1968-09-07', '55', 'Male', 'African American', '190.1', '50.5', '134', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P077', '2024-03-16 03:15 AM', '1968-09-19', '55', 'Male', 'African American', '157.2', '96.7', '170', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P077', '2024-04-15 03:15 AM', '1968-09-19', '55', 'Male', 'African American', '159.1', '96.9', '170', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P077', '2024-05-15 03:15 AM', '1968-09-19', '55', 'Male', 'African American', '160.8', '97.2', '169', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P077', '2024-06-14 03:15 AM', '1968-09-19', '55', 'Male', 'African American', '158.8', '97.3', '170', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P077', '2024-07-14 03:15 AM', '1968-09-19', '55', 'Male', 'African American', '159.7', '97.7', '170', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P078', '2024-03-16 03:30 AM', '1981-08-01', '42', 'Male', 'African American', '264.5', '80.0', '145', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P078', '2024-04-15 03:30 AM', '1981-08-01', '42', 'Male', 'African American', '266.7', '77.5', '145', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P078', '2024-05-15 03:30 AM', '1981-08-01', '42', 'Male', 'African American', '267.3', '76.6', '148', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P078', '2024-06-14 03:30 AM', '1981-08-01', '42', 'Male', 'African American', '268.8', '74.9', '151', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P078', '2024-07-14 03:30 AM', '1981-08-01', '42', 'Male', 'African American', '271.7', '72.8', '151', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P079', '2024-03-16 03:45 AM', '1979-04-04', '44', 'Male', 'White', '236.9', '66.6', '111', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P079', '2024-04-15 03:45 AM', '1979-04-04', '44', 'Male', 'White', '232.6', '67.9', '109', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P079', '2024-05-15 03:45 AM', '1979-04-04', '44', 'Male', 'White', '228.8', '68.5', '110', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P079', '2024-06-14 03:45 AM', '1979-04-04', '44', 'Male', 'White', '226.7', '70.7', '109', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P079', '2024-07-14 03:45 AM', '1979-04-04', '44', 'Male', 'White', '225.8', '71.3', '109', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P080', '2024-03-16 04:00 AM', '1971-05-20', '52', 'Female', 'African American', '194.7', '41.6', '159', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P080', '2024-04-15 04:00 AM', '1971-05-20', '52', 'Female', 'African American', '194.3', '40.7', '158', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P080', '2024-05-15 04:00 AM', '1971-05-20', '52', 'Female', 'African American', '194.6', '40.3', '159', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P080', '2024-06-14 04:00 AM', '1971-05-20', '52', 'Female', 'African American', '194.1', '40.8', '160', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P080', '2024-07-14 04:00 AM', '1971-05-20', '52', 'Female', 'African American', '193.7', '40.3', '160', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P081', '2024-03-16 04:15 AM', '1969-10-14', '54', 'Male', 'African American', '249.8', '70.6', '135', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P081', '2024-04-15 04:15 AM', '1969-10-14', '54', 'Male', 'African American', '250.9', '70.9', '136', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P081', '2024-05-15 04:15 AM', '1969-10-14', '54', 'Male', 'African American', '249.9', '70.8', '135', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P081', '2024-06-14 04:15 AM', '1969-10-14', '54', 'Male', 'African American', '249.5', '71.2', '135', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P081', '2024-07-14 04:15 AM', '1969-10-14', '54', 'Male', 'African American', '251.3', '70.9', '135', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P082', '2024-03-16 04:30 AM', '1974-11-18', '49', 'Male', 'White', '189.8', '54.4', '176', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P082', '2024-04-15 04:30 AM', '1974-11-18', '49', 'Male', 'White', '184.1', '55.4', '176', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P082', '2024-05-15 04:30 AM', '1974-11-18', '49', 'Male', 'White', '180.6', '57.0', '177', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P082', '2024-06-14 04:30 AM', '1974-11-18', '49', 'Male', 'White', '177.6', '58.0', '174', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P082', '2024-07-14 04:30 AM', '1974-11-18', '49', 'Male', 'White', '175.4', '59.1', '173', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P083', '2024-03-16 04:45 AM', '1977-09-02', '46', 'Male', 'White', '185.5', '56.4', '129', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P083', '2024-04-15 04:45 AM', '1977-09-02', '46', 'Male', 'White', '184.2', '57.8', '127', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P083', '2024-05-15 04:45 AM', '1977-09-02', '46', 'Male', 'White', '178.0', '58.3', '128', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P083', '2024-06-14 04:45 AM', '1977-09-02', '46', 'Male', 'White', '173.9', '60.6', '126', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P083', '2024-07-14 04:45 AM', '1977-09-02', '46', 'Male', 'White', '170.1', '61.6', '126', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P084', '2024-03-16 05:00 AM', '1977-12-07', '46', 'Female', 'White', '236.8', '78.0', '178', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '14.9', '50', '0.0', '8', '14.9'],
 ['P084', '2024-04-15 05:00 AM', '1977-12-07', '46', 'Female', 'White', '239.3', '77.1', '179', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '19.6', '50', '0.0', '8', '19.6'],
 ['P084', '2024-05-15 05:00 AM', '1977-12-07', '46', 'Female', 'White', '244.4', '75.9', '178', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '30.1', '50', '0.0', '8', '30.1'],
 ['P084', '2024-06-14 05:00 AM', '1977-12-07', '46', 'Female', 'White', '245.9', '74.8', '178', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '37.8', '50', '0.0', '8', '37.8'],
 ['P084', '2024-07-14 05:00 AM', '1977-12-07', '46', 'Female', 'White', '251.7', '74.3', '178', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '51.0', '50', '0.0', '8', '51.0'],
 ['P085', '2024-03-16 05:15 AM', '1976-07-06', '47', 'Male', 'White', '158.5', '74.7', '141', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P085', '2024-04-15 05:15 AM', '1976-07-06', '47', 'Male', 'White', '158.7', '73.3', '143', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P085', '2024-05-15 05:15 AM', '1976-07-06', '47', 'Male', 'White', '160.2', '72.7', '143', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P085', '2024-06-14 05:15 AM', '1976-07-06', '47', 'Male', 'White', '164.9', '72.4', '143', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P085', '2024-07-14 05:15 AM', '1976-07-06', '47', 'Male', 'White', '169.7', '71.9', '145', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P086', '2024-03-16 05:30 AM', '1982-05-12', '41', 'Male', 'African American', '221.8', '43.6', '118', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P086', '2024-04-15 05:30 AM', '1982-05-12', '41', 'Male', 'African American', '221.2', '44.0', '118', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P086', '2024-05-15 05:30 AM', '1982-05-12', '41', 'Male', 'African American', '222.0', '44.5', '118', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P086', '2024-06-14 05:30 AM', '1982-05-12', '41', 'Male', 'African American', '223.8', '43.5', '119', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P086', '2024-07-14 05:30 AM', '1982-05-12', '41', 'Male', 'African American', '225.3', '44.1', '119', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P087', '2024-03-16 05:45 AM', '1973-08-09', '50', 'Female', 'White', '185.1', '90.5', '140', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.1', '39', '0.0', '8', '0.1'],
 ['P087', '2024-04-15 05:45 AM', '1973-08-09', '50', 'Female', 'White', '181.4', '91.5', '138', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.1', '39', '0.0', '8', '0.1'],
 ['P087', '2024-05-15 05:45 AM', '1973-08-09', '50', 'Female', 'White', '180.7', '92.6', '138', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.1', '39', '0.0', '8', '0.1'],
 ['P087', '2024-06-14 05:45 AM', '1973-08-09', '50', 'Female', 'White', '174.7', '93.9', '137', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P087', '2024-07-14 05:45 AM', '1973-08-09', '50', 'Female', 'White', '170.9', '95.1', '138', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P088', '2024-03-16 06:00 AM', '1966-06-21', '57', 'Male', 'African American', '246.5', '84.2', '125', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P088', '2024-04-15 06:00 AM', '1966-06-21', '57', 'Male', 'African American', '241.6', '85.6', '122', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P088', '2024-05-15 06:00 AM', '1966-06-21', '57', 'Male', 'African American', '239.3', '87.2', '121', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P088', '2024-06-14 06:00 AM', '1966-06-21', '57', 'Male', 'African American', '237.9', '87.9', '121', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P088', '2024-07-14 06:00 AM', '1966-06-21', '57', 'Male', 'African American', '234.1', '89.0', '122', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P089', '2024-03-16 06:15 AM', '1966-09-19', '57', 'Male', 'White', '270.8', '59.8', '167', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P089', '2024-04-15 06:15 AM', '1966-09-19', '57', 'Male', 'White', '268.5', '61.0', '166', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P089', '2024-05-15 06:15 AM', '1966-09-19', '57', 'Male', 'White', '263.7', '62.3', '165', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P089', '2024-06-14 06:15 AM', '1966-09-19', '57', 'Male', 'White', '263.8', '64.1', '164', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P089', '2024-07-14 06:15 AM', '1966-09-19', '57', 'Male', 'White', '259.4', '66.3', '165', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P090', '2024-03-16 06:30 AM', '1967-10-25', '56', 'Male', 'White', '207.2', '88.3', '109', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P090', '2024-04-15 06:30 AM', '1967-10-25', '56', 'Male', 'White', '209.2', '86.1', '109', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P090', '2024-05-15 06:30 AM', '1967-10-25', '56', 'Male', 'White', '211.3', '84.9', '111', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P090', '2024-06-14 06:30 AM', '1967-10-25', '56', 'Male', 'White', '213.5', '83.3', '110', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P090', '2024-07-14 06:30 AM', '1967-10-25', '56', 'Male', 'White', '218.0', '81.6', '112', 'Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P091', '2024-03-16 06:45 AM', '1975-02-20', '49', 'Female', 'African American', '266.7', '84.3', '129', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P091', '2024-04-15 06:45 AM', '1975-02-20', '49', 'Female', 'African American', '266.1', '84.8', '129', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P091', '2024-05-15 06:45 AM', '1975-02-20', '49', 'Female', 'African American', '265.6', '85.2', '130', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P091', '2024-06-14 06:45 AM', '1975-02-20', '49', 'Female', 'African American', '267.3', '85.0', '130', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P091', '2024-07-14 06:45 AM', '1975-02-20', '49', 'Female', 'African American', '265.4', '84.5', '130', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P092', '2024-03-16 07:00 AM', '1979-03-30', '44', 'Female', 'White', '155.6', '53.0', '177', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '7.2', '50', '0.0', '8', '7.2'],
 ['P092', '2024-04-15 07:00 AM', '1979-03-30', '44', 'Female', 'White', '153.6', '54.4', '175', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '4.3', '50', '0.0', '8', '4.3'],
 ['P092', '2024-05-15 07:00 AM', '1979-03-30', '44', 'Female', 'White', '152.0', '55.9', '175', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '2.6', '50', '0.0', '8', '2.6'],
 ['P092', '2024-06-14 07:00 AM', '1979-03-30', '44', 'Female', 'White', '150.0', '57.5', '174', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '1.5', '50', '0.0', '8', '1.5'],
 ['P092', '2024-07-14 07:00 AM', '1979-03-30', '44', 'Female', 'White', '150.0', '60.0', '174', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.8', '50', '0.0', '8', '0.8'],
 ['P093', '2024-03-16 07:15 AM', '1970-06-12', '53', 'Female', 'White', '221.3', '54.4', '155', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P093', '2024-04-15 07:15 AM', '1970-06-12', '53', 'Female', 'White', '218.9', '57.1', '152', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P093', '2024-05-15 07:15 AM', '1970-06-12', '53', 'Female', 'White', '215.6', '58.5', '153', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '99.9', '50', '0.0', '8', '99.9'],
 ['P093', '2024-06-14 07:15 AM', '1970-06-12', '53', 'Female', 'White', '209.9', '60.3', '152', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '96.5', '50', '0.0', '8', '96.5'],
 ['P093', '2024-07-14 07:15 AM', '1970-06-12', '53', 'Female', 'White', '207.4', '60.5', '149', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '93.5', '50', '0.0', '8', '93.5'],
 ['P094', '2024-03-16 07:30 AM', '1967-05-22', '56', 'Male', 'African American', '220.9', '94.0', '96', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P094', '2024-04-15 07:30 AM', '1967-05-22', '56', 'Male', 'African American', '217.7', '95.7', '95', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P094', '2024-05-15 07:30 AM', '1967-05-22', '56', 'Male', 'African American', '215.3', '97.3', '94', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P094', '2024-06-14 07:30 AM', '1967-05-22', '56', 'Male', 'African American', '210.8', '98.7', '94', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P094', '2024-07-14 07:30 AM', '1967-05-22', '56', 'Male', 'African American', '209.2', '100.0', '94', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P095', '2024-03-16 07:45 AM', '1971-04-24', '52', 'Male', 'African American', '161.2', '97.1', '93', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P095', '2024-04-15 07:45 AM', '1971-04-24', '52', 'Male', 'African American', '159.9', '98.0', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P095', '2024-05-15 07:45 AM', '1971-04-24', '52', 'Male', 'African American', '160.2', '98.1', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P095', '2024-06-14 07:45 AM', '1971-04-24', '52', 'Male', 'African American', '161.3', '98.7', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P095', '2024-07-14 07:45 AM', '1971-04-24', '52', 'Male', 'African American', '162.8', '99.6', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P096', '2024-03-16 08:00 AM', '1975-05-24', '48', 'Female', 'African American', '204.7', '69.3', '104', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P096', '2024-04-15 08:00 AM', '1975-05-24', '48', 'Female', 'African American', '203.7', '70.2', '104', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P096', '2024-05-15 08:00 AM', '1975-05-24', '48', 'Female', 'African American', '205.4', '69.3', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P096', '2024-06-14 08:00 AM', '1975-05-24', '48', 'Female', 'African American', '204.9', '69.0', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P096', '2024-07-14 08:00 AM', '1975-05-24', '48', 'Female', 'African American', '203.4', '69.3', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P097', '2024-03-16', '1971-08-10', '52', 'Male', 'African American', '265.8', '82.7', '125', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P097', '2024-04-15', '1971-08-10', '52', 'Male', 'African American', '261.0', '84.1', '123', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P097', '2024-05-15', '1971-08-10', '52', 'Male', 'African American', '257.9', '85.2', '122', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P097', '2024-06-14', '1971-08-10', '52', 'Male', 'African American', '253.9', '85.9', '120', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P097', '2024-07-14', '1971-08-10', '52', 'Male', 'African American', '251.5', '87.4', '118', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P098', '2024-03-16 08:30 AM', '1977-05-01', '46', 'Male', 'African American', '262.8', '56.3', '90', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P098', '2024-04-15 08:30 AM', '1977-05-01', '46', 'Male', 'African American', '256.3', '56.9', '91', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P098', '2024-05-15 08:30 AM', '1977-05-01', '46', 'Male', 'African American', '256.0', '58.7', '92', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P098', '2024-06-14 08:30 AM', '1977-05-01', '46', 'Male', 'African American', '254.0', '60.4', '90', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P098', '2024-07-14 08:30 AM', '1977-05-01', '46', 'Male', 'African American', '251.5', '61.1', '90', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P099', '2024-03-16 08:45 AM', '1976-07-27', '47', 'Male', 'White', '189.5', '52.8', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P099', '2024-04-15 08:45 AM', '1976-07-27', '47', 'Male', 'White', '194.0', '52.0', '108', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P099', '2024-05-15 08:45 AM', '1976-07-27', '47', 'Male', 'White', '199.0', '51.1', '111', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P099', '2024-06-14 08:45 AM', '1976-07-27', '47', 'Male', 'White', '201.6', '49.3', '114', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P099', '2024-07-14 08:45 AM', '1976-07-27', '47', 'Male', 'White', '203.0', '48.0', '114', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P100', '2024-03-16 09:00 AM', '1978-06-24', '45', 'Male', 'African American', '246.8', '56.9', '112', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P100', '2024-04-15 09:00 AM', '1978-06-24', '45', 'Male', 'African American', '245.0', '57.4', '112', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P100', '2024-05-15 09:00 AM', '1978-06-24', '45', 'Male', 'African American', '244.9', '56.6', '112', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P100', '2024-06-14 09:00 AM', '1978-06-24', '45', 'Male', 'African American', '244.6', '56.9', '111', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P100', '2024-07-14 09:00 AM', '1978-06-24', '45', 'Male', 'African American', '245.5', '55.9', '112', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P101', '2024-03-16 09:15 AM', '1978-04-18', '45', 'Male', 'White', '258.5', '61.3', '137', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P101', '2024-04-15 09:15 AM', '1978-04-18', '45', 'Male', 'White', '255.1', '62.1', '137', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P101', '2024-05-15 09:15 AM', '1978-04-18', '45', 'Male', 'White', '249.1', '64.1', '136', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P101', '2024-06-14 09:15 AM', '1978-04-18', '45', 'Male', 'White', '246.8', '64.7', '134', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P101', '2024-07-14 09:15 AM', '1978-04-18', '45', 'Male', 'White', '242.1', '65.3', '132', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P102', '2024-03-16 09:30 AM', '1971-06-17', '52', 'Female', 'African American', '234.7', '40.0', '136', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P102', '2024-04-15 09:30 AM', '1971-06-17', '52', 'Female', 'African American', '237.3', '40.0', '137', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P102', '2024-05-15 09:30 AM', '1971-06-17', '52', 'Female', 'African American', '241.5', '40.9', '136', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P102', '2024-06-14 09:30 AM', '1971-06-17', '52', 'Female', 'African American', '243.0', '40.0', '138', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P102', '2024-07-14 09:30 AM', '1971-06-17', '52', 'Female', 'African American', '246.3', '40.4', '138', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P103', '2024-03-16 09:45 AM', '1982-03-21', '42', 'Male', 'African American', '247.0', '40.8', '140', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P103', '2024-04-15 09:45 AM', '1982-03-21', '42', 'Male', 'African American', '251.2', '40.0', '141', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P103', '2024-05-15 09:45 AM', '1982-03-21', '42', 'Male', 'African American', '254.4', '41.0', '143', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P103', '2024-06-14 09:45 AM', '1982-03-21', '42', 'Male', 'African American', '255.4', '40.0', '143', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P103', '2024-07-14 09:45 AM', '1982-03-21', '42', 'Male', 'African American', '259.6', '40.0', '145', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P104', '2024-03-16 10:00 AM', '1972-08-05', '51', 'Female', 'African American', '253.5', '68.6', '92', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P104', '2024-04-15 10:00 AM', '1972-08-05', '51', 'Female', 'African American', '250.7', '70.2', '91', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P104', '2024-05-15 10:00 AM', '1972-08-05', '51', 'Female', 'African American', '249.2', '71.4', '92', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P104', '2024-06-14 10:00 AM', '1972-08-05', '51', 'Female', 'African American', '247.0', '73.1', '92', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P104', '2024-07-14 10:00 AM', '1972-08-05', '51', 'Female', 'African American', '244.5', '74.3', '90', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P105', '2024-03-16 10:15 AM', '1967-05-14', '56', 'Male', 'African American', '251.6', '67.5', '134', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P105', '2024-04-15 10:15 AM', '1967-05-14', '56', 'Male', 'African American', '250.5', '67.8', '134', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P105', '2024-05-15 10:15 AM', '1967-05-14', '56', 'Male', 'African American', '249.7', '69.1', '132', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P105', '2024-06-14 10:15 AM', '1967-05-14', '56', 'Male', 'African American', '246.3', '70.7', '131', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P105', '2024-07-14 10:15 AM', '1967-05-14', '56', 'Male', 'African American', '244.8', '72.2', '130', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P106', '2024-03-16 10:30 AM', '1974-03-28', '50', 'Male', 'White', '261.9', '70.8', '91', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P106', '2024-04-15 10:30 AM', '1974-03-28', '50', 'Male', 'White', '266.8', '69.1', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P106', '2024-05-15 10:30 AM', '1974-03-28', '50', 'Male', 'White', '269.6', '66.3', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P106', '2024-06-14 10:30 AM', '1974-03-28', '50', 'Male', 'White', '272.4', '65.1', '93', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P106', '2024-07-14 10:30 AM', '1974-03-28', '50', 'Male', 'White', '274.1', '64.9', '93', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P107', '2024-03-16 10:45 AM', '1977-09-09', '46', 'Female', 'White', '206.3', '82.0', '175', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '1.3', '50', '0.0', '8', '1.3'],
 ['P107', '2024-04-15 10:45 AM', '1977-09-09', '46', 'Female', 'White', '206.3', '80.2', '176', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '1.7', '50', '0.0', '8', '1.7'],
 ['P107', '2024-05-15 10:45 AM', '1977-09-09', '46', 'Female', 'White', '209.0', '79.9', '177', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '2.1', '50', '0.0', '8', '2.1'],
 ['P107', '2024-06-14 10:45 AM', '1977-09-09', '46', 'Female', 'White', '210.1', '78.6', '179', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '2.8', '50', '0.0', '8', '2.8'],
 ['P107', '2024-07-14 10:45 AM', '1977-09-09', '46', 'Female', 'White', '210.2', '77.8', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '3.3', '50', '0.0', '8', '3.3'],
 ['P108', '2024-03-16 11:00 AM', '1969-04-28', '54', 'Female', 'African American', '205.9', '49.2', '146', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P108', '2024-04-15 11:00 AM', '1969-04-28', '54', 'Female', 'African American', '205.3', '48.6', '146', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P108', '2024-05-15 11:00 AM', '1969-04-28', '54', 'Female', 'African American', '204.5', '48.2', '147', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P108', '2024-06-14 11:00 AM', '1969-04-28', '54', 'Female', 'African American', '203.8', '48.0', '146', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P108', '2024-07-14 11:00 AM', '1969-04-28', '54', 'Female', 'African American', '202.1', '48.8', '146', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P109', '2024-03-16 11:15 AM', '1967-01-22', '57', 'Male', 'White', '268.6', '84.9', '100', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P109', '2024-04-15 11:15 AM', '1967-01-22', '57', 'Male', 'White', '265.6', '85.0', '97', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P109', '2024-05-15 11:15 AM', '1967-01-22', '57', 'Male', 'White', '262.1', '86.9', '95', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P109', '2024-06-14 11:15 AM', '1967-01-22', '57', 'Male', 'White', '260.4', '88.5', '95', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P109', '2024-07-14 11:15 AM', '1967-01-22', '57', 'Male', 'White', '256.7', '90.3', '93', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P110', '2024-03-16 11:30 AM', '1971-02-26', '53', 'Male', 'White', '249.6', '51.8', '92', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P110', '2024-04-15 11:30 AM', '1971-02-26', '53', 'Male', 'White', '247.3', '53.3', '91', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P110', '2024-05-15 11:30 AM', '1971-02-26', '53', 'Male', 'White', '242.1', '55.6', '90', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P110', '2024-06-14 11:30 AM', '1971-02-26', '53', 'Male', 'White', '241.4', '57.1', '90', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P110', '2024-07-14 11:30 AM', '1971-02-26', '53', 'Male', 'White', '237.9', '59.4', '91', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '46', '100.0', '5', '0.0'],
 ['P111', '2024-03-16 11:45 AM', '1976-06-02', '47', 'Female', 'African American', '179.8', '72.5', '107', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P111', '2024-04-15 11:45 AM', '1976-06-02', '47', 'Female', 'African American', '184.8', '71.9', '109', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P111', '2024-05-15 11:45 AM', '1976-06-02', '47', 'Female', 'African American', '189.2', '70.3', '110', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P111', '2024-06-14 11:45 AM', '1976-06-02', '47', 'Female', 'African American', '192.3', '69.7', '111', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P111', '2024-07-14 11:45 AM', '1976-06-02', '47', 'Female', 'African American', '194.7', '68.0', '111', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P112', '2024-03-16 12:00 PM', '1972-08-16', '51', 'Male', 'White', '229.8', '77.0', '134', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P112', '2024-04-15 12:00 PM', '1972-08-16', '51', 'Male', 'White', '228.8', '79.5', '134', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P112', '2024-05-15 12:00 PM', '1972-08-16', '51', 'Male', 'White', '225.3', '82.1', '134', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P112', '2024-06-14 12:00 PM', '1972-08-16', '51', 'Male', 'White', '220.2', '84.0', '131', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P112', '2024-07-14 12:00 PM', '1972-08-16', '51', 'Male', 'White', '214.1', '85.0', '131', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P113', '2024-03-16 12:15 PM', '1973-09-26', '50', 'Female', 'African American', '198.3', '54.9', '139', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P113', '2024-04-15 12:15 PM', '1973-09-26', '50', 'Female', 'African American', '197.8', '55.0', '139', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P113', '2024-05-15 12:15 PM', '1973-09-26', '50', 'Female', 'African American', '196.6', '54.6', '138', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P113', '2024-06-14 12:15 PM', '1973-09-26', '50', 'Female', 'African American', '195.3', '53.9', '139', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P113', '2024-07-14 12:15 PM', '1973-09-26', '50', 'Female', 'African American', '194.4', '53.6', '139', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P114', '2024-03-16 12:30 PM', '1973-09-25', '50', 'Male', 'White', '183.6', '61.3', '115', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P114', '2024-04-15 12:30 PM', '1973-09-25', '50', 'Male', 'White', '181.7', '61.3', '114', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P114', '2024-05-15 12:30 PM', '1973-09-25', '50', 'Male', 'White', '182.3', '61.5', '113', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P114', '2024-06-14 12:30 PM', '1973-09-25', '50', 'Male', 'White', '181.5', '60.6', '113', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P114', '2024-07-14 12:30 PM', '1973-09-25', '50', 'Male', 'White', '183.2', '61.3', '112', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P115', '2024-03-16 12:45 PM', '1982-06-29', '41', 'Male', 'White', '222.4', '94.2', '102', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P115', '2024-04-15 12:45 PM', '1982-06-29', '41', 'Male', 'White', '224.4', '93.5', '102', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P115', '2024-05-15 12:45 PM', '1982-06-29', '41', 'Male', 'White', '224.2', '92.9', '102', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P115', '2024-06-14 12:45 PM', '1982-06-29', '41', 'Male', 'White', '224.2', '92.6', '103', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P115', '2024-07-14 12:45 PM', '1982-06-29', '41', 'Male', 'White', '225.1', '91.8', '102', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P116', '2024-03-16 01:00 PM', '1979-12-21', '44', 'Female', 'African American', '218.6', '49.0', '154', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P116', '2024-04-15 01:00 PM', '1979-12-21', '44', 'Female', 'African American', '220.1', '47.5', '153', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P116', '2024-05-15 01:00 PM', '1979-12-21', '44', 'Female', 'African American', '223.2', '45.9', '153', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P116', '2024-06-14 01:00 PM', '1979-12-21', '44', 'Female', 'African American', '228.3', '45.2', '153', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P116', '2024-07-14 01:00 PM', '1979-12-21', '44', 'Female', 'African American', '232.1', '44.6', '153', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '39', '0.0', '8', '0.0'],
 ['P117', '2024-03-16 01:15 PM', '1973-01-09', '51', 'Female', 'African American', '221.3', '92.9', '169', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P117', '2024-04-15 01:15 PM', '1973-01-09', '51', 'Female', 'African American', '221.6', '92.6', '169', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P117', '2024-05-15 01:15 PM', '1973-01-09', '51', 'Female', 'African American', '217.8', '94.3', '170', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P117', '2024-06-14 01:15 PM', '1973-01-09', '51', 'Female', 'African American', '215.0', '95.9', '169', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P117', '2024-07-14 01:15 PM', '1973-01-09', '51', 'Female', 'African American', '209.4', '97.2', '168', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P118', '2024-03-16 01:30 PM', '1981-10-21', '42', 'Female', 'White', '237.1', '97.2', '97', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.4', '39', '0.0', '8', '0.4'],
 ['P118', '2024-04-15 01:30 PM', '1981-10-21', '42', 'Female', 'White', '237.3', '97.8', '96', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.4', '39', '0.0', '8', '0.4'],
 ['P118', '2024-05-15 01:30 PM', '1981-10-21', '42', 'Female', 'White', '236.1', '98.6', '96', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.3', '39', '0.0', '8', '0.3'],
 ['P118', '2024-06-14 01:30 PM', '1981-10-21', '42', 'Female', 'White', '236.8', '99.2', '96', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.3', '39', '0.0', '8', '0.3'],
 ['P118', '2024-07-14 01:30 PM', '1981-10-21', '42', 'Female', 'White', '235.7', '100.0', '96', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.3', '39', '0.0', '8', '0.3'],
 ['P119', '2024-03-16 01:45 PM', '1983-02-25', '41', 'Female', 'White', '212.9', '51.7', '149', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '98.9', '50', '0.0', '8', '98.9'],
 ['P119', '2024-04-15 01:45 PM', '1983-02-25', '41', 'Female', 'White', '217.9', '51.1', '151', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '99.9', '50', '0.0', '8', '99.9'],
 ['P119', '2024-05-15 01:45 PM', '1983-02-25', '41', 'Female', 'White', '223.1', '50.7', '153', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P119', '2024-06-14 01:45 PM', '1983-02-25', '41', 'Female', 'White', '225.9', '48.4', '154', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P119', '2024-07-14 01:45 PM', '1983-02-25', '41', 'Female', 'White', '227.5', '46.7', '156', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P120', '2024-03-16 02:00 PM', '1969-08-05', '54', 'Female', 'African American', '222.0', '71.8', '99', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P120', '2024-04-15 02:00 PM', '1969-08-05', '54', 'Female', 'African American', '222.7', '71.8', '98', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P120', '2024-05-15 02:00 PM', '1969-08-05', '54', 'Female', 'African American', '224.1', '71.9', '97', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P120', '2024-06-14 02:00 PM', '1969-08-05', '54', 'Female', 'African American', '222.5', '71.2', '97', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P120', '2024-07-14 02:00 PM', '1969-08-05', '54', 'Female', 'African American', '220.9', '71.0', '97', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P121', '2024-03-16 02:15 PM', '1969-06-26', '54', 'Male', 'African American', '177.0', '91.5', '149', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P121', '2024-04-15 02:15 PM', '1969-06-26', '54', 'Male', 'African American', '178.2', '91.6', '150', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P121', '2024-05-15 02:15 PM', '1969-06-26', '54', 'Male', 'African American', '179.4', '91.3', '149', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P121', '2024-06-14 02:15 PM', '1969-06-26', '54', 'Male', 'African American', '177.9', '91.7', '148', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P121', '2024-07-14 02:15 PM', '1969-06-26', '54', 'Male', 'African American', '179.7', '92.6', '148', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P122', '2024-03-16 02:30 PM', '1969-12-22', '54', 'Male', 'White', '193.8', '65.4', '138', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P122', '2024-04-15 02:30 PM', '1969-12-22', '54', 'Male', 'White', '194.7', '63.9', '138', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P122', '2024-05-15 02:30 PM', '1969-12-22', '54', 'Male', 'White', '198.6', '63.6', '137', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P122', '2024-06-14 02:30 PM', '1969-12-22', '54', 'Male', 'White', '203.2', '63.5', '138', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P122', '2024-07-14 02:30 PM', '1969-12-22', '54', 'Male', 'White', '205.8', '61.4', '139', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P123', '2024-03-16 02:45 PM', '1976-04-30', '47', 'Male', 'White', '268.1', '86.6', '90', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P123', '2024-04-15 02:45 PM', '1976-04-30', '47', 'Male', 'White', '272.9', '85.1', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P123', '2024-05-15 02:45 PM', '1976-04-30', '47', 'Male', 'White', '275.5', '83.9', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P123', '2024-06-14 02:45 PM', '1976-04-30', '47', 'Male', 'White', '276.0', '82.6', '91', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P123', '2024-07-14 02:45 PM', '1976-04-30', '47', 'Male', 'White', '278.9', '82.9', '90', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P124', '2024-03-16 03:00 PM', '1977-03-07', '47', 'Male', 'White', '191.8', '45.8', '155', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P124', '2024-04-15 03:00 PM', '1977-03-07', '47', 'Male', 'White', '192.8', '44.0', '157', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P124', '2024-05-15 03:00 PM', '1977-03-07', '47', 'Male', 'White', '195.8', '42.9', '158', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P124', '2024-06-14 03:00 PM', '1977-03-07', '47', 'Male', 'White', '196.8', '40.7', '158', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P124', '2024-07-14 03:00 PM', '1977-03-07', '47', 'Male', 'White', '203.0', '40.8', '159', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P125', '2024-03-16 03:15 PM', '1970-08-13', '53', 'Female', 'White', '183.4', '57.8', '144', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '61.7', '39', '0.0', '8', '61.7'],
 ['P125', '2024-04-15 03:15 PM', '1970-08-13', '53', 'Female', 'White', '180.5', '58.5', '143', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '48.2', '39', '0.0', '8', '48.2'],
 ['P125', '2024-05-15 03:15 PM', '1970-08-13', '53', 'Female', 'White', '177.1', '58.4', '140', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '40.5', '39', '0.0', '8', '40.5'],
 ['P125', '2024-06-14 03:15 PM', '1970-08-13', '53', 'Female', 'White', '173.6', '58.4', '141', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '32.7', '39', '0.0', '8', '32.7'],
 ['P125', '2024-07-14 03:15 PM', '1970-08-13', '53', 'Female', 'White', '170.9', '59.9', '139', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '20.3', '39', '0.0', '8', '20.3'],
 ['P126', '2024-03-16 03:30 PM', '1978-04-10', '45', 'Male', 'African American', '251.9', '70.2', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P126', '2024-04-15 03:30 PM', '1978-04-10', '45', 'Male', 'African American', '258.5', '69.1', '129', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P126', '2024-05-15 03:30 PM', '1978-04-10', '45', 'Male', 'African American', '262.9', '67.5', '130', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P126', '2024-06-14 03:30 PM', '1978-04-10', '45', 'Male', 'African American', '265.6', '65.4', '131', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P126', '2024-07-14 03:30 PM', '1978-04-10', '45', 'Male', 'African American', '268.1', '65.8', '132', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P127', '2024-03-16 03:45 PM', '1976-07-13', '47', 'Male', 'African American', '255.9', '68.7', '125', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P127', '2024-04-15 03:45 PM', '1976-07-13', '47', 'Male', 'African American', '253.1', '70.4', '123', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P127', '2024-05-15 03:45 PM', '1976-07-13', '47', 'Male', 'African American', '250.3', '71.6', '124', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P127', '2024-06-14 03:45 PM', '1976-07-13', '47', 'Male', 'African American', '246.8', '72.7', '123', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P127', '2024-07-14 03:45 PM', '1976-07-13', '47', 'Male', 'African American', '246.0', '74.9', '124', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P128', '2024-03-16 04:00 PM', '1966-11-15', '57', 'Male', 'White', '240.1', '43.9', '166', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P128', '2024-04-15 04:00 PM', '1966-11-15', '57', 'Male', 'White', '234.8', '45.3', '165', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P128', '2024-05-15 04:00 PM', '1966-11-15', '57', 'Male', 'White', '232.3', '47.2', '165', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P128', '2024-06-14 04:00 PM', '1966-11-15', '57', 'Male', 'White', '228.9', '49.5', '163', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P128', '2024-07-14 04:00 PM', '1966-11-15', '57', 'Male', 'White', '224.0', '50.3', '161', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P129', '2024-03-16 04:15 PM', '1965-08-05', '58', 'Male', 'White', '156.4', '75.9', '101', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P129', '2024-04-15 04:15 PM', '1965-08-05', '58', 'Male', 'White', '155.0', '76.5', '102', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P129', '2024-05-15 04:15 PM', '1965-08-05', '58', 'Male', 'White', '154.5', '76.6', '103', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P129', '2024-06-14 04:15 PM', '1965-08-05', '58', 'Male', 'White', '155.7', '75.7', '102', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P129', '2024-07-14 04:15 PM', '1965-08-05', '58', 'Male', 'White', '156.9', '75.9', '101', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P130', '2024-03-16 04:30 PM', '1983-06-09', '40', 'Male', 'White', '174.6', '69.8', '94', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '5', '100.0', '5', '0.0'],
 ['P130', '2024-04-15 04:30 PM', '1983-06-09', '40', 'Male', 'White', '180.2', '68.8', '93', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '36', '100.0', '5', '0.0'],
 ['P130', '2024-05-15 04:30 PM', '1983-06-09', '40', 'Male', 'White', '179.9', '67.4', '92', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '5', '100.0', '5', '0.0'],
 ['P130', '2024-06-14 04:30 PM', '1983-06-09', '40', 'Male', 'White', '183.3', '67.6', '92', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '36', '100.0', '5', '0.0'],
 ['P130', '2024-07-14 04:30 PM', '1983-06-09', '40', 'Male', 'White', '185.5', '66.4', '92', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '36', '100.0', '5', '0.0'],
 ['P131', '2024-03-16 04:45 PM', '1967-12-20', '56', 'Male', 'White', '171.5', '65.2', '102', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P131', '2024-04-15 04:45 PM', '1967-12-20', '56', 'Male', 'White', '168.2', '65.5', '102', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P131', '2024-05-15 04:45 PM', '1967-12-20', '56', 'Male', 'White', '165.5', '68.1', '100', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P131', '2024-06-14 04:45 PM', '1967-12-20', '56', 'Male', 'White', '162.6', '69.4', '100', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P131', '2024-07-14 04:45 PM', '1967-12-20', '56', 'Male', 'White', '159.2', '69.2', '100', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P132', '2024-03-16 05:00 PM', '1973-04-21', '50', 'Female', 'African American', '153.7', '82.1', '157', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P132', '2024-04-15 05:00 PM', '1973-04-21', '50', 'Female', 'African American', '154.2', '81.8', '158', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P132', '2024-05-15 05:00 PM', '1973-04-21', '50', 'Female', 'African American', '158.5', '81.0', '158', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P132', '2024-06-14 05:00 PM', '1973-04-21', '50', 'Female', 'African American', '159.9', '80.2', '159', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P132', '2024-07-14 05:00 PM', '1973-04-21', '50', 'Female', 'African American', '162.9', '80.0', '161', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P133', '2024-03-16 05:15 PM', '1969-01-28', '55', 'Male', 'African American', '182.3', '40.0', '134', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P133', '2024-04-15 05:15 PM', '1969-01-28', '55', 'Male', 'African American', '181.5', '40.0', '133', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P133', '2024-05-15 05:15 PM', '1969-01-28', '55', 'Male', 'African American', '179.5', '40.6', '133', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P133', '2024-06-14 05:15 PM', '1969-01-28', '55', 'Male', 'African American', '177.9', '40.0', '134', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P133', '2024-07-14 05:15 PM', '1969-01-28', '55', 'Male', 'African American', '177.3', '40.8', '133', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P134', '2024-03-16 05:30 PM', '1975-07-14', '48', 'Male', 'African American', '223.1', '51.0', '164', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P134', '2024-04-15 05:30 PM', '1975-07-14', '48', 'Male', 'African American', '224.1', '51.8', '165', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P134', '2024-05-15 05:30 PM', '1975-07-14', '48', 'Male', 'African American', '225.4', '52.0', '165', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P134', '2024-06-14 05:30 PM', '1975-07-14', '48', 'Male', 'African American', '223.6', '51.3', '165', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P134', '2024-07-14 05:30 PM', '1975-07-14', '48', 'Male', 'African American', '222.1', '52.1', '166', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '5', '0.0'],
 ['P135', '2024-03-16 05:45 PM', '1974-05-16', '49', 'Female', 'African American', '237.1', '95.1', '90', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P135', '2024-04-15 05:45 PM', '1974-05-16', '49', 'Female', 'African American', '230.5', '95.1', '90', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P135', '2024-05-15 05:45 PM', '1974-05-16', '49', 'Female', 'African American', '226.6', '96.4', '90', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P135', '2024-06-14 05:45 PM', '1974-05-16', '49', 'Female', 'African American', '222.8', '97.0', '90', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P135', '2024-07-14 05:45 PM', '1974-05-16', '49', 'Female', 'African American', '221.0', '98.4', '90', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P136', '2024-03-16 06:00 PM', '1976-07-18', '47', 'Male', 'White', '152.0', '62.7', '100', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P136', '2024-04-15 06:00 PM', '1976-07-18', '47', 'Male', 'White', '150.0', '64.5', '99', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P136', '2024-05-15 06:00 PM', '1976-07-18', '47', 'Male', 'White', '151.4', '65.0', '98', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P136', '2024-06-14 06:00 PM', '1976-07-18', '47', 'Male', 'White', '152.0', '66.2', '97', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P136', '2024-07-14 06:00 PM', '1976-07-18', '47', 'Male', 'White', '150.0', '65.9', '95', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P137', '2024-03-16 06:15 PM', '1972-04-09', '51', 'Female', 'African American', '235.5', '66.5', '159', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P137', '2024-04-15 06:15 PM', '1972-04-09', '51', 'Female', 'African American', '236.3', '66.4', '158', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P137', '2024-05-15 06:15 PM', '1972-04-09', '51', 'Female', 'African American', '234.4', '65.4', '158', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P137', '2024-06-14 06:15 PM', '1972-04-09', '51', 'Female', 'African American', '234.4', '66.1', '159', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P137', '2024-07-14 06:15 PM', '1972-04-09', '51', 'Female', 'African American', '235.4', '66.4', '160', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P138', '2024-03-16 06:30 PM', '1968-05-02', '55', 'Female', 'African American', '155.3', '50.2', '155', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P138', '2024-04-15 06:30 PM', '1968-05-02', '55', 'Female', 'African American', '153.7', '50.1', '156', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P138', '2024-05-15 06:30 PM', '1968-05-02', '55', 'Female', 'African American', '153.0', '49.4', '156', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P138', '2024-06-14 06:30 PM', '1968-05-02', '55', 'Female', 'African American', '152.3', '50.2', '156', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P138', '2024-07-14 06:30 PM', '1968-05-02', '55', 'Female', 'African American', '150.4', '49.9', '156', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P139', '2024-03-16 06:45 PM', '1977-09-03', '46', 'Female', 'African American', '248.4', '84.3', '177', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P139', '2024-04-15 06:45 PM', '1977-09-03', '46', 'Female', 'African American', '249.1', '82.4', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P139', '2024-05-15 06:45 PM', '1977-09-03', '46', 'Female', 'African American', '250.4', '80.3', '180', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P139', '2024-06-14 06:45 PM', '1977-09-03', '46', 'Female', 'African American', '253.7', '79.0', '179', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P139', '2024-07-14 06:45 PM', '1977-09-03', '46', 'Female', 'African American', '256.6', '77.5', '179', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P140', '2024-03-16 07:00 PM', '1969-01-13', '55', 'Male', 'White', '269.9', '96.4', '154', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P140', '2024-04-15 07:00 PM', '1969-01-13', '55', 'Male', 'White', '271.5', '95.5', '153', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P140', '2024-05-15 07:00 PM', '1969-01-13', '55', 'Male', 'White', '272.5', '95.5', '154', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P140', '2024-06-14 07:00 PM', '1969-01-13', '55', 'Male', 'White', '271.5', '95.3', '153', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P140', '2024-07-14 07:00 PM', '1969-01-13', '55', 'Male', 'White', '269.5', '94.4', '152', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P141', '2024-03-16 07:15 PM', '1968-01-09', '56', 'Male', 'White', '150.7', '55.9', '140', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P141', '2024-04-15 07:15 PM', '1968-01-09', '56', 'Male', 'White', '150.0', '56.7', '137', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P141', '2024-05-15 07:15 PM', '1968-01-09', '56', 'Male', 'White', '151.4', '56.9', '138', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P141', '2024-06-14 07:15 PM', '1968-01-09', '56', 'Male', 'White', '150.0', '57.5', '137', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P141', '2024-07-14 07:15 PM', '1968-01-09', '56', 'Male', 'White', '150.1', '59.3', '136', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P142', '2024-03-16 07:30 PM', '1983-03-30', '40', 'Male', 'White', '270.1', '45.6', '149', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P142', '2024-04-15 07:30 PM', '1983-03-30', '40', 'Male', 'White', '272.7', '43.5', '149', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P142', '2024-05-15 07:30 PM', '1983-03-30', '40', 'Male', 'White', '276.6', '41.6', '151', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P142', '2024-06-14 07:30 PM', '1983-03-30', '40', 'Male', 'White', '277.4', '40.8', '151', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P142', '2024-07-14 07:30 PM', '1983-03-30', '40', 'Male', 'White', '279.9', '40.2', '151', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P143', '2024-03-16 07:45 PM', '1983-07-17', '40', 'Female', 'White', '160.7', '72.6', '129', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.1', '50', '0.0', '8', '0.1'],
 ['P143', '2024-04-15 07:45 PM', '1983-07-17', '40', 'Female', 'White', '166.8', '71.7', '128', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.2', '50', '0.0', '8', '0.2'],
 ['P143', '2024-05-15 07:45 PM', '1983-07-17', '40', 'Female', 'White', '171.0', '71.0', '128', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.3', '50', '0.0', '8', '0.3'],
 ['P143', '2024-06-14 07:45 PM', '1983-07-17', '40', 'Female', 'White', '175.1', '70.1', '129', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.4', '50', '0.0', '8', '0.4'],
 ['P143', '2024-07-14 07:45 PM', '1983-07-17', '40', 'Female', 'White', '176.4', '70.2', '129', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.5', '50', '0.0', '8', '0.5'],
 ['P144', '2024-03-16 08:00 PM', '1977-06-22', '46', 'Female', 'African American', '268.0', '88.0', '102', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P144', '2024-04-15 08:00 PM', '1977-06-22', '46', 'Female', 'African American', '265.4', '90.3', '101', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P144', '2024-05-15 08:00 PM', '1977-06-22', '46', 'Female', 'African American', '263.2', '92.5', '99', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P144', '2024-06-14 08:00 PM', '1977-06-22', '46', 'Female', 'African American', '260.0', '93.5', '97', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P144', '2024-07-14 08:00 PM', '1977-06-22', '46', 'Female', 'African American', '256.2', '93.7', '97', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P145', '2024-03-16 08:15 PM', '1978-03-27', '46', 'Male', 'White', '193.4', '40.1', '111', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P145', '2024-04-15 08:15 PM', '1978-03-27', '46', 'Male', 'White', '195.2', '40.0', '112', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P145', '2024-05-15 08:15 PM', '1978-03-27', '46', 'Male', 'White', '199.9', '40.0', '115', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P145', '2024-06-14 08:15 PM', '1978-03-27', '46', 'Male', 'White', '204.3', '40.0', '116', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P145', '2024-07-14 08:15 PM', '1978-03-27', '46', 'Male', 'White', '206.3', '41.0', '118', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P146', '2024-03-16 08:30 PM', '1966-07-06', '57', 'Male', 'African American', '272.8', '56.1', '93', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P146', '2024-04-15 08:30 PM', '1966-07-06', '57', 'Male', 'African American', '269.8', '57.2', '93', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P146', '2024-05-15 08:30 PM', '1966-07-06', '57', 'Male', 'African American', '263.1', '57.2', '92', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P146', '2024-06-14 08:30 PM', '1966-07-06', '57', 'Male', 'African American', '259.4', '59.3', '90', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P146', '2024-07-14 08:30 PM', '1966-07-06', '57', 'Male', 'African American', '254.2', '60.4', '91', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P147', '2024-03-16 08:45 PM', '1977-06-27', '46', 'Female', 'African American', '199.1', '55.7', '132', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P147', '2024-04-15 08:45 PM', '1977-06-27', '46', 'Female', 'African American', '197.3', '56.8', '131', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P147', '2024-05-15 08:45 PM', '1977-06-27', '46', 'Female', 'African American', '196.2', '58.4', '130', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P147', '2024-06-14 08:45 PM', '1977-06-27', '46', 'Female', 'African American', '191.2', '58.2', '131', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P147', '2024-07-14 08:45 PM', '1977-06-27', '46', 'Female', 'African American', '185.3', '58.7', '128', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '27', '0.0', '8', '0.0'],
 ['P148', '2024-03-16 09:00 PM', '1969-01-30', '55', 'Male', 'White', '225.4', '98.8', '113', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P148', '2024-04-15 09:00 PM', '1969-01-30', '55', 'Male', 'White', '223.2', '99.2', '114', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P148', '2024-05-15 09:00 PM', '1969-01-30', '55', 'Male', 'White', '218.0', '99.2', '113', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P148', '2024-06-14 09:00 PM', '1969-01-30', '55', 'Male', 'White', '215.2', '99.2', '113', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P148', '2024-07-14 09:00 PM', '1969-01-30', '55', 'Male', 'White', '209.7', '100.0', '110', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P149', '2024-03-16 09:15 PM', '1975-09-13', '48', 'Male', 'White', '158.5', '100.0', '157', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P149', '2024-04-15 09:15 PM', '1975-09-13', '48', 'Male', 'White', '156.4', '99.3', '155', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P149', '2024-05-15 09:15 PM', '1975-09-13', '48', 'Male', 'White', '154.4', '99.1', '153', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P149', '2024-06-14 09:15 PM', '1975-09-13', '48', 'Male', 'White', '151.7', '99.0', '152', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P149', '2024-07-14 09:15 PM', '1975-09-13', '48', 'Male', 'White', '150.8', '99.3', '152', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P150', '2024-03-16 09:30 PM', '1970-06-21', '53', 'Male', 'African American', '253.9', '54.6', '174', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P150', '2024-04-15 09:30 PM', '1970-06-21', '53', 'Male', 'African American', '248.2', '56.8', '175', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P150', '2024-05-15 09:30 PM', '1970-06-21', '53', 'Male', 'African American', '246.3', '58.6', '174', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P150', '2024-06-14 09:30 PM', '1970-06-21', '53', 'Male', 'African American', '243.3', '59.8', '173', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P150', '2024-07-14 09:30 PM', '1970-06-21', '53', 'Male', 'African American', '237.8', '60.4', '172', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P151', '2024-03-16 09:45 PM', '1980-08-14', '43', 'Female', 'African American', '277.2', '48.3', '157', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P151', '2024-04-15 09:45 PM', '1980-08-14', '43', 'Female', 'African American', '277.7', '48.1', '156', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P151', '2024-05-15 09:45 PM', '1980-08-14', '43', 'Female', 'African American', '279.1', '47.4', '158', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P151', '2024-06-14 09:45 PM', '1980-08-14', '43', 'Female', 'African American', '280.0', '46.4', '159', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P151', '2024-07-14 09:45 PM', '1980-08-14', '43', 'Female', 'African American', '278.5', '44.6', '159', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P152', '2024-03-16 10:00 PM', '1969-10-03', '54', 'Female', 'African American', '204.5', '97.9', '172', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P152', '2024-04-15 10:00 PM', '1969-10-03', '54', 'Female', 'African American', '204.9', '99.6', '172', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P152', '2024-05-15 10:00 PM', '1969-10-03', '54', 'Female', 'African American', '201.5', '100.0', '172', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P152', '2024-06-14 10:00 PM', '1969-10-03', '54', 'Female', 'African American', '198.7', '100.0', '173', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P152', '2024-07-14 10:00 PM', '1969-10-03', '54', 'Female', 'African American', '196.7', '100.0', '172', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P153', '2024-03-16 10:15 PM', '1973-01-18', '51', 'Male', 'White', '246.6', '82.0', '133', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P153', '2024-04-15 10:15 PM', '1973-01-18', '51', 'Male', 'White', '246.9', '82.3', '133', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P153', '2024-05-15 10:15 PM', '1973-01-18', '51', 'Male', 'White', '246.6', '81.7', '133', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P153', '2024-06-14 10:15 PM', '1973-01-18', '51', 'Male', 'White', '247.6', '82.0', '132', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P153', '2024-07-14 10:15 PM', '1973-01-18', '51', 'Male', 'White', '247.0', '81.2', '133', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P154', '2024-03-16 10:30 PM', '1972-02-04', '52', 'Male', 'African American', '213.3', '40.0', '98', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P154', '2024-04-15 10:30 PM', '1972-02-04', '52', 'Male', 'African American', '217.5', '40.0', '101', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P154', '2024-05-15 10:30 PM', '1972-02-04', '52', 'Male', 'African American', '219.6', '40.0', '103', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P154', '2024-06-14 10:30 PM', '1972-02-04', '52', 'Male', 'African American', '219.7', '40.4', '105', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P154', '2024-07-14 10:30 PM', '1972-02-04', '52', 'Male', 'African American', '220.5', '40.6', '106', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P155', '2024-03-16 10:45 PM', '1972-10-11', '51', 'Male', 'White', '202.8', '41.7', '115', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P155', '2024-04-15 10:45 PM', '1972-10-11', '51', 'Male', 'White', '198.3', '42.3', '115', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P155', '2024-05-15 10:45 PM', '1972-10-11', '51', 'Male', 'White', '194.5', '42.9', '115', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P155', '2024-06-14 10:45 PM', '1972-10-11', '51', 'Male', 'White', '189.7', '44.1', '114', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P155', '2024-07-14 10:45 PM', '1972-10-11', '51', 'Male', 'White', '186.2', '46.9', '111', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P156', '2024-03-16 11:00 PM', '1972-09-10', '51', 'Male', 'African American', '180.8', '67.7', '110', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P156', '2024-04-15 11:00 PM', '1972-09-10', '51', 'Male', 'African American', '181.4', '68.5', '111', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P156', '2024-05-15 11:00 PM', '1972-09-10', '51', 'Male', 'African American', '181.1', '68.1', '112', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P156', '2024-06-14 11:00 PM', '1972-09-10', '51', 'Male', 'African American', '181.5', '67.5', '111', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P156', '2024-07-14 11:00 PM', '1972-09-10', '51', 'Male', 'African American', '180.1', '68.5', '111', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P157', '2024-03-16 11:15 PM', '1982-01-19', '42', 'Male', 'African American', '275.5', '58.2', '106', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P157', '2024-04-15 11:15 PM', '1982-01-19', '42', 'Male', 'African American', '276.6', '59.1', '105', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P157', '2024-05-15 11:15 PM', '1982-01-19', '42', 'Male', 'African American', '278.0', '59.3', '105', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P157', '2024-06-14 11:15 PM', '1982-01-19', '42', 'Male', 'African American', '277.3', '59.5', '105', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P157', '2024-07-14 11:15 PM', '1982-01-19', '42', 'Male', 'African American', '276.6', '59.9', '104', 'Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P158', '2024-03-16 11:30 PM', '1974-10-04', '49', 'Male', 'White', '221.3', '98.0', '131', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '46', '100.0', '5', '0.0'],
 ['P158', '2024-04-15 11:30 PM', '1974-10-04', '49', 'Male', 'White', '223.0', '97.4', '131', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '46', '100.0', '5', '0.0'],
 ['P158', '2024-05-15 11:30 PM', '1974-10-04', '49', 'Male', 'White', '221.0', '96.4', '130', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '46', '100.0', '5', '0.0'],
 ['P158', '2024-06-14 11:30 PM', '1974-10-04', '49', 'Male', 'White', '219.8', '96.8', '131', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '46', '100.0', '5', '0.0'],
 ['P158', '2024-07-14 11:30 PM', '1974-10-04', '49', 'Male', 'White', '221.5', '95.9', '131', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '46', '100.0', '5', '0.0'],
 ['P159', '2024-03-16 11:45 PM', '1981-05-27', '42', 'Male', 'White', '191.7', '49.8', '167', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P159', '2024-04-15 11:45 PM', '1981-05-27', '42', 'Male', 'White', '189.3', '51.0', '165', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P159', '2024-05-15 11:45 PM', '1981-05-27', '42', 'Male', 'White', '185.0', '52.4', '164', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P159', '2024-06-14 11:45 PM', '1981-05-27', '42', 'Male', 'White', '180.8', '52.6', '165', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P159', '2024-07-14 11:45 PM', '1981-05-27', '42', 'Male', 'White', '180.0', '54.8', '166', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P160', '2024-03-17 12:00 AM', '1979-02-06', '45', 'Male', 'White', '222.6', '64.6', '129', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P160', '2024-04-16 12:00 AM', '1979-02-06', '45', 'Male', 'White', '224.3', '62.9', '130', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P160', '2024-05-16 12:00 AM', '1979-02-06', '45', 'Male', 'White', '224.3', '61.3', '131', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P160', '2024-06-15 12:00 AM', '1979-02-06', '45', 'Male', 'White', '228.0', '59.1', '133', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P160', '2024-07-15 12:00 AM', '1979-02-06', '45', 'Male', 'White', '231.9', '56.9', '135', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P161', '2024-03-17 12:15 AM', '1976-06-08', '47', 'Male', 'White', '212.1', '88.7', '129', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P161', '2024-04-16 12:15 AM', '1976-06-08', '47', 'Male', 'White', '214.8', '87.1', '130', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P161', '2024-05-16 12:15 AM', '1976-06-08', '47', 'Male', 'White', '217.2', '86.0', '132', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P161', '2024-06-15 12:15 AM', '1976-06-08', '47', 'Male', 'White', '219.5', '85.1', '134', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P161', '2024-07-15 12:15 AM', '1976-06-08', '47', 'Male', 'White', '221.8', '83.9', '135', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P162', '2024-03-17 12:30 AM', '1971-04-29', '52', 'Male', 'White', '274.5', '80.1', '109', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P162', '2024-04-16 12:30 AM', '1971-04-29', '52', 'Male', 'White', '277.4', '78.3', '110', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P162', '2024-05-16 12:30 AM', '1971-04-29', '52', 'Male', 'White', '279.5', '78.1', '112', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P162', '2024-06-15 12:30 AM', '1971-04-29', '52', 'Male', 'White', '279.9', '77.4', '113', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P162', '2024-07-15 12:30 AM', '1971-04-29', '52', 'Male', 'White', '278.6', '77.0', '114', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P163', '2024-03-17 12:45 AM', '1977-01-25', '47', 'Male', 'African American', '271.6', '52.6', '115', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P163', '2024-04-16 12:45 AM', '1977-01-25', '47', 'Male', 'African American', '274.6', '51.5', '116', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P163', '2024-05-16 12:45 AM', '1977-01-25', '47', 'Male', 'African American', '278.5', '50.0', '116', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P163', '2024-06-15 12:45 AM', '1977-01-25', '47', 'Male', 'African American', '278.9', '49.0', '116', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P163', '2024-07-15 12:45 AM', '1977-01-25', '47', 'Male', 'African American', '280.0', '47.5', '117', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P164', '2024-03-17 01:00 AM', '1973-12-09', '50', 'Female', 'African American', '264.0', '47.7', '159', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P164', '2024-04-16 01:00 AM', '1973-12-09', '50', 'Female', 'African American', '269.8', '47.1', '160', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P164', '2024-05-16 01:00 AM', '1973-12-09', '50', 'Female', 'African American', '271.8', '44.6', '161', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P164', '2024-06-15 01:00 AM', '1973-12-09', '50', 'Female', 'African American', '273.0', '42.9', '161', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P164', '2024-07-15 01:00 AM', '1973-12-09', '50', 'Female', 'African American', '277.6', '41.9', '162', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P165', '2024-03-17 01:15 AM', '1974-08-01', '49', 'Female', 'White', '232.0', '73.4', '129', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '36.8', '50', '0.0', '8', '36.8'],
 ['P165', '2024-04-16 01:15 AM', '1974-08-01', '49', 'Female', 'White', '230.4', '74.0', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '31.3', '50', '0.0', '8', '31.3'],
 ['P165', '2024-05-16 01:15 AM', '1974-08-01', '49', 'Female', 'White', '228.9', '73.5', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '31.3', '50', '0.0', '8', '31.3'],
 ['P165', '2024-06-15 01:15 AM', '1974-08-01', '49', 'Female', 'White', '228.3', '73.6', '129', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '30.0', '50', '0.0', '8', '30.0'],
 ['P165', '2024-07-15 01:15 AM', '1974-08-01', '49', 'Female', 'White', '229.2', '74.0', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '29.5', '50', '0.0', '8', '29.5'],
 ['P166', '2024-03-17 01:30 AM', '1970-10-30', '53', 'Male', 'African American', '235.0', '47.3', '110', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P166', '2024-04-16 01:30 AM', '1970-10-30', '53', 'Male', 'African American', '235.0', '46.4', '111', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P166', '2024-05-16 01:30 AM', '1970-10-30', '53', 'Male', 'African American', '234.9', '46.4', '112', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P166', '2024-06-15 01:30 AM', '1970-10-30', '53', 'Male', 'African American', '235.9', '47.1', '112', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P166', '2024-07-15 01:30 AM', '1970-10-30', '53', 'Male', 'African American', '237.3', '47.5', '112', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P167', '2024-03-17 01:45 AM', '1981-10-03', '42', 'Male', 'White', '242.5', '78.4', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P167', '2024-04-16 01:45 AM', '1981-10-03', '42', 'Male', 'White', '242.1', '78.1', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P167', '2024-05-16 01:45 AM', '1981-10-03', '42', 'Male', 'White', '241.7', '77.4', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P167', '2024-06-15 01:45 AM', '1981-10-03', '42', 'Male', 'White', '242.5', '78.1', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P167', '2024-07-15 01:45 AM', '1981-10-03', '42', 'Male', 'White', '242.2', '77.9', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P168', '2024-03-17 02:00 AM', '1973-01-27', '51', 'Female', 'African American', '273.2', '48.2', '163', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P168', '2024-04-16 02:00 AM', '1973-01-27', '51', 'Female', 'African American', '275.9', '46.3', '166', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P168', '2024-05-16 02:00 AM', '1973-01-27', '51', 'Female', 'African American', '280.0', '44.9', '167', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P168', '2024-06-15 02:00 AM', '1973-01-27', '51', 'Female', 'African American', '278.9', '44.5', '170', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P168', '2024-07-15 02:00 AM', '1973-01-27', '51', 'Female', 'African American', '279.0', '42.6', '172', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P169', '2024-03-17 02:15 AM', '1966-09-20', '57', 'Female', 'African American', '191.3', '90.8', '164', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P169', '2024-04-16 02:15 AM', '1966-09-20', '57', 'Female', 'African American', '194.8', '90.9', '163', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P169', '2024-05-16 02:15 AM', '1966-09-20', '57', 'Female', 'African American', '196.4', '90.3', '164', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P169', '2024-06-15 02:15 AM', '1966-09-20', '57', 'Female', 'African American', '200.6', '89.6', '165', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P169', '2024-07-15 02:15 AM', '1966-09-20', '57', 'Female', 'African American', '204.2', '89.5', '165', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P170', '2024-03-17 02:30 AM', '1978-04-21', '45', 'Female', 'African American', '266.9', '98.7', '167', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P170', '2024-04-16 02:30 AM', '1978-04-21', '45', 'Female', 'African American', '268.0', '98.9', '167', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P170', '2024-05-16 02:30 AM', '1978-04-21', '45', 'Female', 'African American', '268.9', '99.1', '168', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P170', '2024-06-15 02:30 AM', '1978-04-21', '45', 'Female', 'African American', '270.1', '98.6', '167', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P170', '2024-07-15 02:30 AM', '1978-04-21', '45', 'Female', 'African American', '272.0', '99.1', '168', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '0.0', '50', '0.0', '8', '0.0'],
 ['P171', '2024-03-17 02:45 AM', '1978-12-18', '45', 'Male', 'White', '261.4', '58.5', '105', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P171', '2024-04-16 02:45 AM', '1978-12-18', '45', 'Male', 'White', '260.2', '57.8', '105', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P171', '2024-05-16 02:45 AM', '1978-12-18', '45', 'Male', 'White', '260.2', '57.7', '106', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P171', '2024-06-15 02:45 AM', '1978-12-18', '45', 'Male', 'White', '259.8', '56.7', '105', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P171', '2024-07-15 02:45 AM', '1978-12-18', '45', 'Male', 'White', '260.7', '56.9', '106', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P172', '2024-03-17 03:00 AM', '1965-06-10', '58', 'Female', 'African American', '233.0', '51.2', '100', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P172', '2024-04-16 03:00 AM', '1965-06-10', '58', 'Female', 'African American', '237.5', '50.4', '99', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P172', '2024-05-16 03:00 AM', '1965-06-10', '58', 'Female', 'African American', '239.0', '50.8', '98', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P172', '2024-06-15 03:00 AM', '1965-06-10', '58', 'Female', 'African American', '244.5', '49.6', '97', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P172', '2024-07-15 03:00 AM', '1965-06-10', '58', 'Female', 'African American', '249.5', '47.1', '98', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P173', '2024-03-17 03:15 AM', '1965-04-18', '58', 'Male', 'African American', '248.7', '48.8', '99', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P173', '2024-04-16 03:15 AM', '1965-04-18', '58', 'Male', 'African American', '254.2', '47.6', '100', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P173', '2024-05-16 03:15 AM', '1965-04-18', '58', 'Male', 'African American', '255.1', '47.1', '102', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P173', '2024-06-15 03:15 AM', '1965-04-18', '58', 'Male', 'African American', '258.8', '46.5', '103', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P173', '2024-07-15 03:15 AM', '1965-04-18', '58', 'Male', 'African American', '263.7', '45.1', '104', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P174', '2024-03-17 03:30 AM', '1972-01-07', '52', 'Female', 'African American', '250.6', '54.0', '137', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P174', '2024-04-16 03:30 AM', '1972-01-07', '52', 'Female', 'African American', '253.2', '51.9', '140', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P174', '2024-05-16 03:30 AM', '1972-01-07', '52', 'Female', 'African American', '253.4', '51.4', '143', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P174', '2024-06-15 03:30 AM', '1972-01-07', '52', 'Female', 'African American', '257.4', '49.9', '145', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P174', '2024-07-15 03:30 AM', '1972-01-07', '52', 'Female', 'African American', '261.1', '48.9', '148', 'Non-Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P175', '2024-03-17 03:45 AM', '1976-05-16', '47', 'Female', 'White', '277.5', '87.0', '101', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '30.9', '50', '0.0', '8', '30.9'],
 ['P175', '2024-04-16 03:45 AM', '1976-05-16', '47', 'Female', 'White', '280.0', '85.9', '102', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '39.1', '50', '0.0', '8', '39.1'],
 ['P175', '2024-05-16 03:45 AM', '1976-05-16', '47', 'Female', 'White', '278.4', '84.8', '104', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '42.1', '50', '0.0', '8', '42.1'],
 ['P175', '2024-06-15 03:45 AM', '1976-05-16', '47', 'Female', 'White', '280.0', '82.3', '105', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '58.8', '50', '0.0', '8', '58.8'],
 ['P175', '2024-07-15 03:45 AM', '1976-05-16', '47', 'Female', 'White', '278.6', '80.9', '105', 'Diabetic', 'Non-Smoker', 'On Treatment', '1', '64.9', '50', '0.0', '8', '64.9'],
 ['P176', '2024-03-17 04:00 AM', '1974-05-05', '49', 'Male', 'African American', '251.1', '60.1', '142', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P176', '2024-04-16 04:00 AM', '1974-05-05', '49', 'Male', 'African American', '251.7', '59.4', '142', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P176', '2024-05-16 04:00 AM', '1974-05-05', '49', 'Male', 'African American', '250.3', '59.5', '141', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P176', '2024-06-15 04:00 AM', '1974-05-05', '49', 'Male', 'African American', '249.6', '59.1', '140', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P176', '2024-07-15 04:00 AM', '1974-05-05', '49', 'Male', 'African American', '250.7', '58.7', '141', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P177', '2024-03-17 04:15 AM', '1965-11-12', '58', 'Male', 'African American', '273.5', '72.3', '131', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P177', '2024-04-16 04:15 AM', '1965-11-12', '58', 'Male', 'African American', '274.8', '72.3', '132', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P177', '2024-05-16 04:15 AM', '1965-11-12', '58', 'Male', 'African American', '274.9', '73.1', '132', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P177', '2024-06-15 04:15 AM', '1965-11-12', '58', 'Male', 'African American', '275.0', '73.1', '131', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P177', '2024-07-15 04:15 AM', '1965-11-12', '58', 'Male', 'African American', '276.6', '72.8', '130', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P178', '2024-03-17 04:30 AM', '1974-07-19', '49', 'Male', 'African American', '276.8', '61.1', '121', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P178', '2024-04-16 04:30 AM', '1974-07-19', '49', 'Male', 'African American', '275.2', '61.1', '121', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P178', '2024-05-16 04:30 AM', '1974-07-19', '49', 'Male', 'African American', '275.6', '61.6', '122', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P178', '2024-06-15 04:30 AM', '1974-07-19', '49', 'Male', 'African American', '277.0', '61.5', '122', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P178', '2024-07-15 04:30 AM', '1974-07-19', '49', 'Male', 'African American', '277.8', '61.3', '123', 'Diabetic', 'Smoker', 'On Treatment', '1', '0.0', '69', '0.0', '5', '0.0'],
 ['P179', '2024-03-17 04:45 AM', '1981-07-09', '42', 'Male', 'White', '225.0', '83.1', '130', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P179', '2024-04-16 04:45 AM', '1981-07-09', '42', 'Male', 'White', '225.9', '81.4', '131', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P179', '2024-05-16 04:45 AM', '1981-07-09', '42', 'Male', 'White', '227.6', '78.7', '131', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P179', '2024-06-15 04:45 AM', '1981-07-09', '42', 'Male', 'White', '229.8', '77.4', '133', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P179', '2024-07-15 04:45 AM', '1981-07-09', '42', 'Male', 'White', '231.5', '76.4', '134', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P180', '2024-03-17 05:00 AM', '1975-09-06', '48', 'Male', 'White', '206.3', '99.4', '99', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P180', '2024-04-16 05:00 AM', '1975-09-06', '48', 'Male', 'White', '207.5', '99.0', '98', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P180', '2024-05-16 05:00 AM', '1975-09-06', '48', 'Male', 'White', '208.6', '99.5', '97', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P180', '2024-06-15 05:00 AM', '1975-09-06', '48', 'Male', 'White', '207.7', '98.9', '97', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P180', '2024-07-15 05:00 AM', '1975-09-06', '48', 'Male', 'White', '207.8', '98.5', '96', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '100.0', '69', '100.0', '5', '0.0'],
 ['P181', '2024-03-17 05:15 AM', '1966-08-29', '57', 'Female', 'White', '158.2', '58.1', '153', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '21.2', '50', '0.0', '8', '21.2'],
 ['P181', '2024-04-16 05:15 AM', '1966-08-29', '57', 'Female', 'White', '158.1', '58.4', '152', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '19.8', '50', '0.0', '8', '19.8'],
 ['P181', '2024-05-16 05:15 AM', '1966-08-29', '57', 'Female', 'White', '159.4', '59.2', '151', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '18.5', '50', '0.0', '8', '18.5'],
 ['P181', '2024-06-15 05:15 AM', '1966-08-29', '57', 'Female', 'White', '160.7', '58.7', '152', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '22.6', '50', '0.0', '8', '22.6'],
 ['P181', '2024-07-15 05:15 AM', '1966-08-29', '57', 'Female', 'White', '161.7', '58.7', '153', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '24.3', '50', '0.0', '8', '24.3'],
 ['P182', '2024-03-17 05:30 AM', '1983-02-22', '41', 'Male', 'African American', '219.1', '47.0', '97', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '46', '0.0', '5', '0.0'],
 ['P182', '2024-04-16 05:30 AM', '1983-02-22', '41', 'Male', 'African American', '216.2', '48.4', '96', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '46', '0.0', '5', '0.0'],
 ['P182', '2024-05-16 05:30 AM', '1983-02-22', '41', 'Male', 'African American', '210.8', '50.1', '97', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '46', '0.0', '5', '0.0'],
 ['P182', '2024-06-15 05:30 AM', '1983-02-22', '41', 'Male', 'African American', '208.7', '52.2', '97', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '46', '0.0', '5', '0.0'],
 ['P182', '2024-07-15 05:30 AM', '1983-02-22', '41', 'Male', 'African American', '206.5', '53.2', '95', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '46', '0.0', '5', '0.0'],
 ['P183', '2024-03-17 05:45 AM', '1974-02-08', '50', 'Male', 'African American', '181.9', '94.0', '95', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P183', '2024-04-16 05:45 AM', '1974-02-08', '50', 'Male', 'African American', '183.5', '94.7', '96', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P183', '2024-05-16 05:45 AM', '1974-02-08', '50', 'Male', 'African American', '185.3', '95.3', '97', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P183', '2024-06-15 05:45 AM', '1974-02-08', '50', 'Male', 'African American', '185.0', '95.9', '97', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P183', '2024-07-15 05:45 AM', '1974-02-08', '50', 'Male', 'African American', '183.0', '95.6', '97', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P184', '2024-03-17 06:00 AM', '1970-10-11', '53', 'Female', 'White', '188.0', '44.1', '92', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P184', '2024-04-16 06:00 AM', '1970-10-11', '53', 'Female', 'White', '188.5', '44.2', '93', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P184', '2024-05-16 06:00 AM', '1970-10-11', '53', 'Female', 'White', '186.7', '43.5', '94', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P184', '2024-06-15 06:00 AM', '1970-10-11', '53', 'Female', 'White', '185.4', '43.6', '94', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P184', '2024-07-15 06:00 AM', '1970-10-11', '53', 'Female', 'White', '185.1', '43.4', '95', 'Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '50', '0.0', '8', '100.0'],
 ['P185', '2024-03-17 06:15 AM', '1977-03-25', '47', 'Female', 'African American', '175.0', '46.9', '179', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P185', '2024-04-16 06:15 AM', '1977-03-25', '47', 'Female', 'African American', '180.8', '46.1', '180', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P185', '2024-05-16 06:15 AM', '1977-03-25', '47', 'Female', 'African American', '185.0', '45.1', '180', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P185', '2024-06-15 06:15 AM', '1977-03-25', '47', 'Female', 'African American', '187.6', '43.0', '180', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P185', '2024-07-15 06:15 AM', '1977-03-25', '47', 'Female', 'African American', '192.8', '42.0', '179', 'Non-Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P186', '2024-03-17 06:30 AM', '1967-07-22', '56', 'Male', 'White', '150.0', '95.4', '98', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P186', '2024-04-16 06:30 AM', '1967-07-22', '56', 'Male', 'White', '150.0', '95.7', '97', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P186', '2024-05-16 06:30 AM', '1967-07-22', '56', 'Male', 'White', '150.8', '97.9', '95', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P186', '2024-06-15 06:30 AM', '1967-07-22', '56', 'Male', 'White', '150.0', '100.0', '92', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P186', '2024-07-15 06:30 AM', '1967-07-22', '56', 'Male', 'White', '150.0', '100.0', '90', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P187', '2024-03-17 06:45 AM', '1978-12-28', '45', 'Male', 'African American', '218.4', '77.0', '126', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P187', '2024-04-16 06:45 AM', '1978-12-28', '45', 'Male', 'African American', '222.0', '76.6', '127', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P187', '2024-05-16 06:45 AM', '1978-12-28', '45', 'Male', 'African American', '225.5', '75.1', '130', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P187', '2024-06-15 06:45 AM', '1978-12-28', '45', 'Male', 'African American', '231.8', '73.9', '131', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P187', '2024-07-15 06:45 AM', '1978-12-28', '45', 'Male', 'African American', '235.7', '73.2', '133', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '0.0', '50', '0.0', '5', '0.0'],
 ['P188', '2024-03-17 07:00 AM', '1980-03-31', '43', 'Male', 'African American', '252.4', '97.7', '177', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P188', '2024-04-16 07:00 AM', '1980-03-31', '43', 'Male', 'African American', '254.1', '97.7', '178', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P188', '2024-05-16 07:00 AM', '1980-03-31', '43', 'Male', 'African American', '255.9', '97.3', '178', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P188', '2024-06-15 07:00 AM', '1980-03-31', '43', 'Male', 'African American', '255.0', '97.4', '178', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P188', '2024-07-15 07:00 AM', '1980-03-31', '43', 'Male', 'African American', '255.5', '97.7', '179', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P189', '2024-03-17 07:15 AM', '1972-05-22', '51', 'Male', 'African American', '272.4', '95.7', '146', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P189', '2024-04-16 07:15 AM', '1972-05-22', '51', 'Male', 'African American', '269.0', '97.4', '145', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P189', '2024-05-16 07:15 AM', '1972-05-22', '51', 'Male', 'African American', '268.9', '98.7', '143', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P189', '2024-06-15 07:15 AM', '1972-05-22', '51', 'Male', 'African American', '266.5', '100.0', '141', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P189', '2024-07-15 07:15 AM', '1972-05-22', '51', 'Male', 'African American', '263.6', '100.0', '140', 'Diabetic', 'Non-Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P190', '2024-03-17 07:30 AM', '1969-03-21', '55', 'Female', 'African American', '200.7', '44.1', '162', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P190', '2024-04-16 07:30 AM', '1969-03-21', '55', 'Female', 'African American', '198.0', '46.7', '161', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P190', '2024-05-16 07:30 AM', '1969-03-21', '55', 'Female', 'African American', '193.0', '49.2', '159', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P190', '2024-06-15 07:30 AM', '1969-03-21', '55', 'Female', 'African American', '192.3', '49.8', '158', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P190', '2024-07-15 07:30 AM', '1969-03-21', '55', 'Female', 'African American', '188.1', '51.5', '155', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P191', '2024-03-17 07:45 AM', '1982-05-25', '41', 'Male', 'White', '280.0', '70.3', '176', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P191', '2024-04-16 07:45 AM', '1982-05-25', '41', 'Male', 'White', '280.0', '69.4', '175', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P191', '2024-05-16 07:45 AM', '1982-05-25', '41', 'Male', 'White', '279.6', '68.0', '177', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P191', '2024-06-15 07:45 AM', '1982-05-25', '41', 'Male', 'White', '279.3', '66.3', '178', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P191', '2024-07-15 07:45 AM', '1982-05-25', '41', 'Male', 'White', '279.7', '66.0', '177', 'Non-Diabetic', 'Smoker', 'On Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P192', '2024-03-17 08:00 AM', '1978-06-15', '45', 'Female', 'White', '187.0', '59.7', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '19.0', '50', '0.0', '8', '19.0'],
 ['P192', '2024-04-16 08:00 AM', '1978-06-15', '45', 'Female', 'White', '186.8', '59.5', '129', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '19.6', '50', '0.0', '8', '19.6'],
 ['P192', '2024-05-16 08:00 AM', '1978-06-15', '45', 'Female', 'White', '188.0', '58.9', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '23.8', '50', '0.0', '8', '23.8'],
 ['P192', '2024-06-15 08:00 AM', '1978-06-15', '45', 'Female', 'White', '186.3', '59.7', '129', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '18.2', '50', '0.0', '8', '18.2'],
 ['P192', '2024-07-15 08:00 AM', '1978-06-15', '45', 'Female', 'White', '185.5', '59.8', '128', 'Diabetic', 'Smoker', 'Not on Treatment', '0', '16.9', '50', '0.0', '8', '16.9'],
 ['P193', '2024-03-17', '1983-03-03', '41', 'Male', 'White', '199.1', '42.6', '174', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P193', '2024-04-16', '1983-03-03', '41', 'Male', 'White', '198.4', '42.2', '174', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P193', '2024-05-16', '1983-03-03', '41', 'Male', 'White', '198.1', '42.9', '174', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P193', '2024-06-15', '1983-03-03', '41', 'Male', 'White', '196.3', '42.0', '175', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P193', '2024-07-15', '1983-03-03', '41', 'Male', 'White', '197.0', '41.5', '176', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '100.0', '50', '100.0', '5', '0.0'],
 ['P194', '2024-03-17 08:30 AM', '1971-01-26', '53', 'Female', 'African American', '263.2', '50.2', '103', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P194', '2024-04-16 08:30 AM', '1971-01-26', '53', 'Female', 'African American', '262.2', '51.4', '103', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P194', '2024-05-16 08:30 AM', '1971-01-26', '53', 'Female', 'African American', '256.9', '53.9', '103', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P194', '2024-06-15 08:30 AM', '1971-01-26', '53', 'Female', 'African American', '254.9', '54.0', '102', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P194', '2024-07-15 08:30 AM', '1971-01-26', '53', 'Female', 'African American', '254.9', '54.8', '100', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '50', '0.0', '8', '0.0'],
 ['P195', '2024-03-17 08:45 AM', '1977-06-13', '46', 'Female', 'African American', '181.0', '91.1', '151', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P195', '2024-04-16 08:45 AM', '1977-06-13', '46', 'Female', 'African American', '180.0', '91.3', '152', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P195', '2024-05-16 08:45 AM', '1977-06-13', '46', 'Female', 'African American', '181.0', '92.1', '151', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P195', '2024-06-15 08:45 AM', '1977-06-13', '46', 'Female', 'African American', '181.7', '92.3', '152', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P195', '2024-07-15 08:45 AM', '1977-06-13', '46', 'Female', 'African American', '180.1', '92.4', '153', 'Non-Diabetic', 'Non-Smoker', 'Not on Treatment', '1', '0.0', '39', '0.0', '8', '0.0'],
 ['P196', '2024-03-17 09:00 AM', '1983-03-22', '41', 'Male', 'African American', '248.7', '48.1', '94', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P196', '2024-04-16 09:00 AM', '1983-03-22', '41', 'Male', 'African American', '248.5', '47.1', '95', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P196', '2024-05-16 09:00 AM', '1983-03-22', '41', 'Male', 'African American', '249.9', '46.2', '96', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P196', '2024-06-15 09:00 AM', '1983-03-22', '41', 'Male', 'African American', '249.7', '45.5', '96', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P196', '2024-07-15 09:00 AM', '1983-03-22', '41', 'Male', 'African American', '250.3', '46.2', '96', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P197', '2024-03-17 09:15 AM', '1965-04-18', '58', 'Female', 'White', '240.9', '66.9', '102', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P197', '2024-04-16 09:15 AM', '1965-04-18', '58', 'Female', 'White', '243.4', '64.4', '103', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P197', '2024-05-16 09:15 AM', '1965-04-18', '58', 'Female', 'White', '247.4', '63.1', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P197', '2024-06-15 09:15 AM', '1965-04-18', '58', 'Female', 'White', '249.6', '61.2', '105', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P197', '2024-07-15 09:15 AM', '1965-04-18', '58', 'Female', 'White', '252.4', '59.1', '106', 'Diabetic', 'Non-Smoker', 'Not on Treatment', '0', '100.0', '50', '0.0', '8', '100.0'],
 ['P198', '2024-03-17 09:30 AM', '1977-12-04', '46', 'Male', 'White', '157.8', '41.6', '166', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P198', '2024-04-16 09:30 AM', '1977-12-04', '46', 'Male', 'White', '159.6', '41.4', '165', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P198', '2024-05-16 09:30 AM', '1977-12-04', '46', 'Male', 'White', '163.5', '40.0', '166', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P198', '2024-06-15 09:30 AM', '1977-12-04', '46', 'Male', 'White', '165.3', '40.0', '167', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P198', '2024-07-15 09:30 AM', '1977-12-04', '46', 'Male', 'White', '170.1', '40.0', '169', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '1', '100.0', '69', '100.0', '5', '0.0'],
 ['P199', '2024-03-17 09:45 AM', '1981-02-01', '43', 'Male', 'African American', '261.1', '82.4', '119', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P199', '2024-04-16 09:45 AM', '1981-02-01', '43', 'Male', 'African American', '259.6', '82.7', '119', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P199', '2024-05-16 09:45 AM', '1981-02-01', '43', 'Male', 'African American', '260.4', '82.9', '118', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P199', '2024-06-15 09:45 AM', '1981-02-01', '43', 'Male', 'African American', '262.3', '82.0', '118', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P199', '2024-07-15 09:45 AM', '1981-02-01', '43', 'Male', 'African American', '260.7', '82.7', '117', 'Diabetic', 'Smoker', 'On Treatment', '0', '0.0', '69', '0.0', '5', '0.0'],
 ['P200', '2024-03-17 10:00 AM', '1974-09-06', '49', 'Male', 'White', '201.0', '92.5', '133', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P200', '2024-04-16 10:00 AM', '1974-09-06', '49', 'Male', 'White', '201.5', '92.7', '134', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P200', '2024-05-16 10:00 AM', '1974-09-06', '49', 'Male', 'White', '203.0', '92.6', '133', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P200', '2024-06-15 10:00 AM', '1974-09-06', '49', 'Male', 'White', '203.4', '93.3', '134', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0'],
 ['P200', '2024-07-15 10:00 AM', '1974-09-06', '49', 'Male', 'White', '202.6', '93.8', '134', 'Non-Diabetic', 'Smoker', 'Not on Treatment', '0', '100.0', '50', '100.0', '5', '0.0']
]


const CardioVascularPrediction = (props) => {
  const [tab, setTab] = useState(0);
  const [metricsData, setMetricsData] = useState(null);
  const [subGroupMetricsData, setSubGroupMetricsData] = useState(null);
  const [genderMetrics, setGenderMetrics] = useState(null);
  const [raceMetrics, setRaceMetrics] = useState(null);
  const { goBack } = props;
  const [csvData, setCsvData] = useState("");
  const [ageGroupDist, setAgeGroupDist] = useState({});
  const [genderDist, setGenderDist] = useState({});
  const [raceDist, setRaceDist] = useState({});
  const [thresholdDist, setThresholdDist] = useState(20);

  // const PREDICTION_SERVER = "http://54.166.135.219:5000";
  const PREDICTION_SERVER = "http://localhost:5000";

  const handleCsvReady = (csv) => {
    console.log("CSV received in parent:", csv);
    setCsvData(csv);
  };

  const handleTabChange = (event, newValue) => setTab(newValue);

  useEffect(() => {

    const fetchMetrics = async () => {
      console.log("fetching metrics")
      console.log(csvData)

      try {

        const [headers, ...rows] = csvData;
        let formattedCsvData = rows.map(row =>
          headers.reduce((acc, header, index) => {
            acc[header] = row[index];
            return acc;
          }, {})
        );

        let result = formattedCsvData.map(row => ({
          ...row,
          Prediction_Timestamp: new Date(row.Prediction_Timestamp),
          Actual: parseInt(row.ASCVD_Actual_Outcome)
        }));
        console.log("formatted csv data");
        console.log(formattedCsvData);

        // Sort by Prediction_Timestamp and deduplicate by Patient_ID
        const sorted = [...result].sort((a, b) =>
          new Date(a.Prediction_Timestamp) - new Date(b.Prediction_Timestamp)
        );

        const unique = new Map();
        sorted.forEach(row => {
          unique.set(row.Patient_ID, row); // keeps last by timestamp due to sorting
        });

        const finalData = Array.from(unique.values());
        console.log("finalData csv data");
        console.log(finalData);

        const data = await CalculateMetricsForScore(finalData,'TenYearScore',thresholdDist);

        // const y_true = finalData.map(row => row.Actual);
        // const y_pred = finalData.map(row => row.Prediction);
        // console.log(y_true + "--" + y_pred);

        // const data = await CalculateMetrics(y_true, y_pred);

        const formatted = {
          summary_metrics: {
            overall_accuracy: data.Accuracy,
            alert_reliability: data.Precision,
            need_detection_rate: data.Recall,
            balanced_score: data["F1 Score"]
          },
          confusion_matrix: {
            true_positive: data["True Positive"],
            false_negative: data["False Negative"],
            false_positive: data["False Positive"],
            true_negative: data["True Negative"],
            true_positive_rate: data["True Positive Rate"].toFixed(2),
            true_negative_rate: data["True Negative Rate"].toFixed(2),
            false_positive_rate: data["False Positive Rate"].toFixed(2),
            false_negative_rate: data["False Negative Rate"].toFixed(2)
          },
          detailed_metrics: {
            accuracy: data.Accuracy,
            precision: data.Precision,
            recall: data.Recall,
            f1_score: data["F1 Score"],
            brier_score: data["Brier Score"]
          },
          accuracy_over_time: {
            months: ['Jan 2024', 'Apr 2024', 'Jul 2024', 'Oct 2024', 'Jan 2025'],
            claimed: [90, 90, 90, 90, 90],
            measured: [80, 75, 95, 85, 78]
          },
          roc_curve: {
            fpr: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
            tpr: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
            auc: 0.5
          }
        };

        setMetricsData(formatted);
      } catch (err) {
        console.error("API fetch failed", err);
      }
    };
    if (csvData && csvData.length > 0 && tab === 0) {
      console.log("csvData found")
      fetchMetrics();
    }
  }, [csvData, tab,thresholdDist]);

  // useEffect(() => {
  //   handleCsvReady(cvd_csv);
  // }, []);

  useEffect(() => {
    const runSubgroup = async () => {
      if (csvData && csvData.length > 0 && tab === 1) {
        const [headers, ...rows] = csvData;
        let formattedCsvData = rows.map(row =>
          headers.reduce((acc, header, index) => {
            acc[header] = row[index];
            return acc;
          }, {})
        );
        
        let formattedData = formattedCsvData.map(row => ({
          ...row,
          Prediction_Timestamp: new Date(row.Prediction_Timestamp),
          Actual: parseInt(row.ASCVD_Actual_Outcome)
        }));
        console.log("formatted csv data");
        console.log(formattedData);

        const subgroupGenderResult = await CalculateSubgroupMetrics(
          formattedData,
          'Gender',
          true,
          thresholdDist
        );

        console.log('Subgroup Gender Metrics:', subgroupGenderResult);
        const subgroupRaceResult = await CalculateSubgroupMetrics(
          formattedData,
          'Race',
          true,
          thresholdDist
        );
        console.log('Subgroup Race Metrics:', subgroupRaceResult);
        setGenderMetrics(subgroupGenderResult);
        setRaceMetrics(subgroupRaceResult);
      }
    };

    runSubgroup();
  }, [csvData, tab,thresholdDist]);

  useEffect(() => {
    const runDistributions = async () => {
      if (csvData && csvData.length > 0 && tab === 2) {
        const [headers, ...rows] = csvData;
        let formattedCsvData = rows.map(row =>
          headers.reduce((acc, header, index) => {
            acc[header] = row[index];
            return acc;
          }, {})
        );
        console.log(formattedCsvData)
        const {ageGroups,genderCounts,raceCounts} = calculateDistributions(formattedCsvData);
        console.log(ageGroups);
        setAgeGroupDist(ageGroups);
        console.log(genderCounts);  
        setGenderDist(genderCounts);      
        console.log(raceCounts);
        setRaceDist(raceCounts);
      }
    }
    runDistributions()
  }, [csvData, tab,thresholdDist]);

  const calculateDistributions = (data) => {
    const ageGroups = { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 };
    const genderCounts = {};
    const raceCounts = {};

    const deduplicatedMap = new Map();

    data.forEach(row => {
      const patientId = row.Patient_ID;
      const currentTimestamp = new Date(row.Prediction_Timestamp);
  
      if (!deduplicatedMap.has(patientId)) {
        deduplicatedMap.set(patientId, row);
      } else {
        const existing = deduplicatedMap.get(patientId);
        const existingTimestamp = new Date(existing.Prediction_Timestamp);
        if (currentTimestamp > existingTimestamp) {
          deduplicatedMap.set(patientId, row);
        }
      }
    });
  
    const latestData = Array.from(deduplicatedMap.values());
  
    latestData.forEach((row) => {
      // Age calculation
      const birthDate = new Date(row.Birthdate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 60) ageGroups['36-60']++;
      else ageGroups['60+']++;
  
      // Gender
      const gender = row.Gender?.trim() || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
  
      // Race
      const race = row.Race?.trim() || 'Unknown';
      raceCounts[race] = (raceCounts[race] || 0) + 1;
    });
  
    return { ageGroups, genderCounts, raceCounts };
  };

  const metrics = metricsData ? [
    { label: 'Overall Accuracy', value: `${(metricsData.summary_metrics.overall_accuracy * 100).toFixed(1)}%` },
    { label: 'CVD Prediction Reliability', value: `${(metricsData.summary_metrics.alert_reliability * 100).toFixed(1)}%` },
    { label: 'CVD Prediction detection Rate', value: `${(metricsData.summary_metrics.need_detection_rate * 100).toFixed(1)}%` },
    { label: 'Balanced CVD Prediction score', value: metricsData.summary_metrics.balanced_score.toFixed(2) }
  ] : [];

  const accuracyChart = {
    labels: metricsData?.accuracy_over_time.months || [],
    datasets: [
      {
        label: 'Claimed Accuracy',
        data: metricsData?.accuracy_over_time.claimed || [],
        borderColor: 'blue',
        fill: false
      },
      {
        label: 'Measured Accuracy',
        data: metricsData?.accuracy_over_time.measured || [],
        borderColor: 'red',
        fill: false
      }
    ]
  };

  const barChartData = {
    labels: ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'Brier Score'],
    datasets: [
      {
        label: 'Score',
        data: metricsData ? [
          metricsData.detailed_metrics.accuracy,
          metricsData.detailed_metrics.precision,
          metricsData.detailed_metrics.recall,
          metricsData.detailed_metrics.f1_score,
          metricsData.detailed_metrics.brier_score
        ] : [],
        backgroundColor: ['#d0e7f9', '#a5cbe2', '#7fb0cc', '#5894b6', '#3379a0']
      }
    ]
  };

  const rocChart = {
    labels: metricsData?.roc_curve.fpr || [],
    datasets: [
      {
        label: `ROC curve (area = ${metricsData?.roc_curve.auc.toFixed(2)})`,
        data: metricsData?.roc_curve.tpr || [],
        borderColor: 'blue',
        fill: false
      }
    ]
  };


  const recalculateMetrics = (threshold) =>{
    setThresholdDist(threshold);
  }
  return (
    <div>
      <CKDPredictionCsvFromFhir onCsvReady={handleCsvReady} />
      <Box p={4} m={2} width="calc(100%-32px)" margin="20px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
      >
        <Box width="100%" mb={2} display="flex" justifyContent="flex-start">
          <Button variant="outlined" onClick={goBack}>
            ← Back
          </Button>
        </Box>
        <Typography variant="h5" gutterBottom>
          Accuracy Metrics: CVD Prediction (Ten Year Score)
        </Typography>

        {metricsData && (
          <>
            <Grid container spacing={2} justifyContent="flex-start" width="100%">
              {metrics.map((metric, i) => (
                <Grid item key={i} width="20%">
                  <Card>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary">
                        {metric.label}
                      </Typography>
                      <Typography variant="h6">{metric.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid> 
           


            <Box mt={4} width="100%">
              <Box display="flex" justifyContent="left">
                <Tabs value={tab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                  <Tab label="Performance Metrics" />
                  <Tab label="Subgroup Analysis" />
                  <Tab label="Data Distribution" />
                </Tabs>
              </Box>
              {tab === 0 && (
                <MetricsSection topic="CVD" metricsData={metricsData} accuracyChart={accuracyChart} barChartData={barChartData} rocChart={rocChart} recalculateMetrics={recalculateMetrics}/>
              )}
              {tab === 1 && (
                <Box mt={4}>
                  <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} md={8} width="45%">
                      <Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
                        <SubgroupBarChart title="Gender-wise Visualization" rawData={genderMetrics} selectedFeature="Gender" />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={8} width="45%">
                      <Paper elevation={2} style={{ padding: '16px', height: '100%' }}>
                        <SubgroupBarChart title="Race-wise Precision" rawData={raceMetrics} selectedFeature="Race" />
                      </Paper>
                    </Grid>
                  </Grid>
                  {/* <SubgroupBarChart title="Age Group Recall" data={ageGroupMetrics} metricKey="Recall" /> */}
                </Box>
              )}

              {tab === 2 && (
                <Box mt={4}>
                  <h5 align="left">Patient Demographic Distribution</h5>
                  <DistributionCharts ageGroups={ageGroupDist} genderCounts={genderDist} raceCounts={raceDist} />
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};

export default CardioVascularPrediction;
