/**
 * API Service for Battery Digital Twin Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health/`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchBenchmark(dataset = 'nasa') {
  const res = await fetch(`${API_BASE_URL}/models/benchmark/?dataset=${dataset}`);
  if (!res.ok) throw new Error('Benchmark fetch failed');
  return res.json();
}

export async function fetchFeatureImportance(dataset = 'nasa') {
  const res = await fetch(`${API_BASE_URL}/models/feature-importance/?dataset=${dataset}`);
  if (!res.ok) throw new Error('Feature importance fetch failed');
  return res.json();
}

export async function predictRUL(payload) {
  const res = await fetch(`${API_BASE_URL}/predict/rul/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Prediction failed');
  }
  return res.json();
}

export async function predictTrajectory(payload) {
  const res = await fetch(`${API_BASE_URL}/predict/trajectory/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Trajectory prediction failed');
  return res.json();
}

export async function fetchCellsList() {
  const res = await fetch(`${API_BASE_URL}/telemetry/cells/`);
  if (!res.ok) throw new Error('Cells list fetch failed');
  return res.json();
}

export async function fetchCellDetail(cellId) {
  const res = await fetch(`${API_BASE_URL}/telemetry/cell/${cellId}/`);
  if (!res.ok) throw new Error(`Cell detail fetch failed for ${cellId}`);
  return res.json();
}

export async function simulateStep(payload) {
  const res = await fetch(`${API_BASE_URL}/digital-twin/simulate/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Simulation step failed');
  return res.json();
}

export async function runWhatIfAnalysis(payload) {
  const res = await fetch(`${API_BASE_URL}/digital-twin/what-if/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('What-if analysis failed');
  return res.json();
}

export async function uploadBatchCSV(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/data/upload-csv/`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'CSV upload failed');
  }
  return res.json();
}

export async function fetchSummaryReport() {
  const res = await fetch(`${API_BASE_URL}/reports/summary/`);
  if (!res.ok) throw new Error('Summary report fetch failed');
  return res.json();
}
