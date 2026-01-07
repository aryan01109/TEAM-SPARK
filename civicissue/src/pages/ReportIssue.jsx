import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/UserHeader";
import "../styles/ReportIssue.css";
import { Loader } from '@googlemaps/js-api-loader';

// Import auth function
function getAuth() {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    
    if (token && role && username) {
      return { token, role, username };
    }
    return null;
  } catch {
    return null;
  }
}

// GOOGLE_MAPS_API_KEY removed (not referenced)

// Helper function to load Google Maps script
function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      reject(new Error("Google Maps API key is not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your environment variables."));
      return;
    }

    const loader = new Loader({
      apiKey,
      libraries: ['places', 'geometry']
    });

    // Provide an auth-failure hook so we can detect invalid API keys and reject early
    const prevGmAuthFailure = window.gm_authFailure;
    window.gm_authFailure = function() {
      try {
        // cleanup
        if (window.gm_authFailure === arguments.callee) window.gm_authFailure = prevGmAuthFailure;
      } catch (e) {
        // ignore
      }
      reject(new Error('Google Maps authentication failed (invalid API key or restricted referrer).'));
    };

    loader.load().then(() => {
      // cleanup auth handler
      try { if (window.gm_authFailure === prevGmAuthFailure) window.gm_authFailure = prevGmAuthFailure; } catch (e) {}
      resolve();
    }).catch((err) => {
      try { if (window.gm_authFailure === prevGmAuthFailure) window.gm_authFailure = prevGmAuthFailure; } catch (e) {}
      reject(new Error(`Failed to load Google Maps API: ${err?.message || err}`));
    });
  });
}

export default function ReportIssue({ onLogout }) {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const objectUrlRef = useRef(null);
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [formTouched, setFormTouched] = useState({
    title: false,
    category: false,
    location: false
  });

  // On-screen debug logs (captures console messages while this component is mounted)
  // NOTE: on-screen debug panel removed to simplify UI.

  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "null");
      setIsAuthenticated(!!(auth && auth.token));
    } catch (error) {
      setIsAuthenticated(false);
    }
  }, []);

  const validateFile = useCallback((file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB for media
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload only JPEG, PNG, or WebP images.');
      return false;
    }
    
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }
    
    return true;
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      setPreviewIsVideo(false);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      return;
    }
    
    if (!validateFile(file)) {
      return;
    }
    
    setError('');
    setPhoto(file);
    // If it's a video, create an object URL for preview (avoid FileReader for large files)
    if (file.type && file.type.startsWith('video/')) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      setPhotoPreview(url);
      setPreviewIsVideo(true);
    } else {
      setPreviewIsVideo(false);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [validateFile]);

  // Camera functionality
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    // Feature detect getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('NO_VIDEO_SUPPORT', { navigator: !!navigator, mediaDevices: !!navigator.mediaDevices });
      setError('Camera is not supported by this browser or blocked by the environment. Use HTTPS (or localhost) and a modern browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      console.debug('startCamera: stream acquired', stream);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          // Ensure the video element actually starts playing (some browsers require explicit play())
          await videoRef.current.play();
          console.debug('startCamera: video play() succeeded, readyState=', videoRef.current.readyState, 'videoWidth=', videoRef.current.videoWidth, 'videoHeight=', videoRef.current.videoHeight);
        } catch (playErr) {
          console.debug('startCamera: video.play() failed', playErr);
        }
      }
      setShowCamera(true);
      setError('');
    } catch (err) {
      // Provide more actionable error messages based on the error name
      try {
        console.error('Error accessing camera:', err);
        const name = err && err.name ? err.name : (typeof err === 'string' ? err : 'UnknownError');
        const message = err && err.message ? err.message : String(err);
        let friendly = 'Could not access camera. Please ensure you have granted permission and that your device has a camera.';

        if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
          friendly = 'Camera access was denied. Please allow camera permissions in your browser settings.';
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          friendly = 'No camera device was found. Please connect a camera and try again.';
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          friendly = 'The camera is already in use by another application.';
        } else if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
          friendly = 'No camera matches the requested constraints. Try switching camera or device.';
        } else if (name === 'TypeError') {
          // Safari sometimes throws TypeError when getUserMedia is not available
          friendly = 'Camera is not available in this context. Make sure you are using HTTPS or localhost.';
        }

        // Append the raw error name/message to debug logs for advanced troubleshooting
        setError(friendly + (message ? ` (${name}: ${message})` : ''));
      } catch (inner) {
        console.error('startCamera: error handling failure', inner);
        setError('Could not access camera. Please check browser permissions and try again.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    console.debug('stopCamera: called');
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        try { track.stop(); } catch (e) { /* ignore */ }
      });
      streamRef.current = null;
      console.debug('stopCamera: tracks stopped');
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    console.debug('capturePhoto: called');
    if (!videoRef.current) {
      console.debug('capturePhoto: no videoRef');
      return;
    }

    const takeSnapshot = async () => {
      try {
        // Wait for video dimensions to be available
        let attempts = 0;
        while ((videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) && attempts < 10) {
          console.debug('capturePhoto: waiting for video dimensions, attempt', attempts + 1);
          // wait for loadedmetadata or 100ms
          await new Promise((r) => {
            const onMeta = () => { r(); };
            videoRef.current.addEventListener('loadedmetadata', onMeta, { once: true });
            setTimeout(r, 100);
          });
          attempts += 1;
        }

        const width = videoRef.current.videoWidth || videoRef.current.clientWidth || 640;
        const height = videoRef.current.videoHeight || videoRef.current.clientHeight || 480;
        console.debug('capturePhoto: using dimensions', { width, height, readyState: videoRef.current.readyState });

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            console.debug('capturePhoto: blob created', { size: blob.size, type: blob.type });
            const file = new File([blob], `issue-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            console.debug('capturePhoto: file created', { name: file.name, size: file.size, type: file.type });
            setPhoto(file);
            handleFileSelect(file);
            stopCamera();
          } else {
            console.debug('capturePhoto: canvas.toBlob returned null');
          }
        }, 'image/jpeg', 0.8);
      } catch (err) {
        console.error('capturePhoto: error taking snapshot', err);
      }
    };

    if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      takeSnapshot();
    } else {
      console.debug('capturePhoto: waiting for canplay or loadedmetadata');
      const handler = () => { takeSnapshot(); };
      videoRef.current.addEventListener('canplay', handler, { once: true });
      videoRef.current.addEventListener('loadedmetadata', handler, { once: true });
      // fallback timeout
      setTimeout(() => {
        if (videoRef.current && (videoRef.current.videoWidth > 0 || videoRef.current.videoHeight > 0)) return;
        console.debug('capturePhoto: fallback timeout, attempting snapshot');
        takeSnapshot();
      }, 1000);
    }
    
  }, [handleFileSelect, stopCamera]);

  const onFileChange = useCallback((e) => {
    const file = e.target.files?.[0] ?? null;
    handleFileSelect(file);
  }, [handleFileSelect]);

  // Cleanup any created object URLs when component unmounts or when photo changes
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dt = e.dataTransfer;
    let file = null;
    if (dt.files && dt.files.length > 0) {
      file = dt.files[0];
    } else if (dt.items && dt.items.length > 0) {
      // Some environments provide items
      const item = dt.items[0];
      if (item.kind === 'file') {
        file = item.getAsFile();
      }
    }
    handleFileSelect(file);
  }, [handleFileSelect]);

  // Helper function for reverse geocoding
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
        setLocationText(`Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&result_type=street_address|route|neighborhood|locality`
      );
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results.length > 0) {
        // Try to get the most specific address available
        let bestAddress = null;
        
        // Prefer street address, then route, then neighborhood, then locality
        const addressTypes = ['street_address', 'route', 'neighborhood', 'locality', 'sublocality', 'political'];
        
        for (const result of data.results) {
          for (const preferredType of addressTypes) {
            if (result.types.includes(preferredType)) {
              bestAddress = result.formatted_address;
              break;
            }
          }
          if (bestAddress) break;
        }
        
        // If no specific type found, use the first result
        if (!bestAddress && data.results[0]) {
          bestAddress = data.results[0].formatted_address;
        }
        
        // Clean up the address (remove country if it's too long)
        if (bestAddress) {
          const addressParts = bestAddress.split(',');
          if (addressParts.length > 3) {
            // Keep only the first 3 parts (street, city, state) for shorter display
            bestAddress = addressParts.slice(0, 3).join(',').trim();
          }
          setLocationText(bestAddress);
        } else {
          setLocationText(`Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
      } else {
        setLocationText(`Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (geocodeError) {
      console.error('Reverse geocoding failed:', geocodeError);
      setLocationText(`Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  }, []);

  const handleMapLocationSelect = useCallback(({ lat, lng, address }) => {
    setCoords({ lat, lng });
    // Always prefer address over coordinates
    if (address && address !== `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`) {
      setLocationText(address);
    } else {
      // If no proper address, try to get one
      reverseGeocode(lat, lng);
    }
    setError("");
  }, [reverseGeocode]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Enhanced validation
    if (!title.trim()) {
      setError("Please add a short title for the issue.");
      document.querySelector('input[name="title"]')?.focus();
      return;
    }
    
    if (title.trim().length < 10) {
      setError("Title must be at least 10 characters long.");
      return;
    }
    
    if (!category) {
      setError("Please choose an issue category.");
      document.querySelector('select[name="category"]')?.focus();
      return;
    }
    
    if (!locationText.trim() && !coords.lat) {
      setError("Please provide a location for the issue.");
      document.getElementById('location-input')?.focus();
      return;
    }
    
    setSubmitting(true);

    try {
      console.debug('handleSubmit: preparing submission', { title, category, locationText, coords, photo });
      // Get user info if available
      let submittedBy = "anonymous";
      try {
        const auth = JSON.parse(localStorage.getItem("auth") || "null");
        if (auth && auth.user && auth.user.username) {
          submittedBy = auth.user.username;
        }
      } catch (err) {
        // If there's an error parsing auth data, keep submittedBy as "anonymous"
        console.log("Could not get user info, submitting as anonymous");
      }

      // Prepare the payload for the reports API (supports photos)
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location_text: locationText.trim() || `Lat: ${coords.lat?.toFixed(5)}, Lng: ${coords.lng?.toFixed(5)}`,
        category: category, // Map category to department
        lat: coords.lat || null,
        lng: coords.lng || null,
        submittedBy: submittedBy
      };

      // Create form data to submit with photo
      const formData = new FormData();
      
      // Add all payload fields to form data
      Object.keys(payload).forEach(key => {
        formData.append(key, payload[key]);
      });
      
      // If there's a photo, add it to the form data
      if (photo) {
        formData.append('photo', photo);
      }
      // Debug: log formData entries
      try {
        for (const entry of formData.entries()) {
          const [k, v] = entry;
          if (v instanceof File) {
            console.debug('handleSubmit: formData entry', k, { name: v.name, size: v.size, type: v.type });
          } else {
            console.debug('handleSubmit: formData entry', k, v);
          }
        }
      } catch (fdErr) {
        console.debug('handleSubmit: error reading formData entries', fdErr);
      }
      
      // Submit using the report API which supports photos
      const reportResponse = await fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:5000"}/reports`, {
        method: "POST",
        // Don't set Content-Type header - let the browser set it with the boundary
        headers: {
          Authorization: `Bearer ${getAuth()?.token}`
        },
        body: formData
      });
      
      if (!reportResponse.ok) {
        const errorText = await reportResponse.text();
        throw new Error(errorText || "Failed to submit report");
      }
      
      const result = await reportResponse.json();
      console.log('Report submitted:', result);

      // Reset form
      setTitle("");
      setCategory("");
      setDescription("");
      setPhoto(null);
      setPhotoPreview(null);
      setCoords({ lat: null, lng: null });
      setLocationText("");
      setError("");
      
      setSuccess("Report submitted successfully with photo! Thank you for helping improve your community.");
      
      // Navigate back after showing success message
      setTimeout(() => {
        if (isAuthenticated) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }, 2000);
      
    } catch (err) {
      console.error('Submission error:', err);
      setError("Submission failed. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }, [title, category, description, coords, locationText, navigate, isAuthenticated]);

  const formValidation = useMemo(() => {
    return {
      isTitleValid: title.trim().length >= 10,
      isCategoryValid: !!category,
      isLocationValid: !!(locationText.trim() || coords.lat),
      canSubmit: title.trim().length >= 10 && category && (locationText.trim() || coords.lat)
    };
  }, [title, category, locationText, coords.lat]);

  const useCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    setError("");
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoadingLocation(false);
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      setCoords({ lat: latitude, lng: longitude });
      
      // Get human-readable address
      await reverseGeocode(latitude, longitude);
      
    } catch (error) {
      console.error('Geolocation error:', error);
      let errorMessage = "Unable to get your location. ";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "Please enable location access in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage += "Location request timed out. Please try again.";
          break;
        default:
          errorMessage += "Please select the location manually on the map.";
          break;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingLocation(false);
    }
  }, [reverseGeocode]);

  return (
    <div className="report-page-fullscreen">
      <Header onLogout={onLogout} />
      
      <div className="report-content">
        <div className="report-header">
          <button 
            type="button" 
            className="btn-back btn-ghost" 
            onClick={() => navigate(-1)}
            aria-label="Go back to previous page"
          >
            ← Back
          </button>
          <div className="report-title-section">
            <h1 className="report-heading">Report a Civic Issue</h1>
            <p className="report-sub">Help make your city better by reporting local problems</p>
          </div>
        </div>

        <div className="report-main">


        {error && (
          <div className="error-message" role="alert" aria-live="polite">
            <span aria-hidden="true">⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="success-message" role="status" aria-live="polite">
            <span aria-hidden="true">✅</span> {success}
          </div>
        )}

        <form className="report-form" onSubmit={handleSubmit} noValidate>
          {/* Category */}
          <label className="field">
            <span className="field-label">
              Issue Category <span className="required" aria-label="required">*</span>
            </span>
            <select 
              className={`input ${!formValidation.isCategoryValid && formTouched.category ? "input-error" : ""}`}
              name="category"
              value={category} 
              onChange={(e) => {
                setCategory(e.target.value);
                setFormTouched(prev => ({ ...prev, category: true }));
              }}
              onBlur={() => setFormTouched(prev => ({ ...prev, category: true }))}
              required
              aria-describedby="category-help"
            >
              <option value="">Select issue type</option>
              <option value="Pothole">Potholes</option>
              <option value="Manhole">Broken / Missing Manhole Covers</option>
              <option value="Footpath">Damaged Footpaths / Sidewalks</option>
              <option value="ConstructionDebris">Unfinished Construction Debris</option>
              <option value="Encroachment">Encroachment on Public Spaces</option>
              <option value="Streetlight">Non-functional Streetlights</option>
              <option value="Wiring">Exposed / Dangerous Wiring</option>
              <option value="TrafficSignal">Broken Traffic Signals</option>
              <option value="GarbageOverflow">Uncollected Garbage / Overflowing Bins</option>
              <option value="IllegalDumping">Illegal Dumping of Waste</option>
              <option value="BlockedDrains">Blocked Drains / Open Sewage</option>
              <option value="DeadAnimals">Dead Animals Not Removed</option>
              <option value="WaterLeak">Water Leakage from Pipelines</option>
              <option value="Waterlogging">Waterlogging / Flooded Streets</option>
              <option value="ContaminatedWater">Contaminated Drinking Water</option>
              <option value="LowWaterPressure">Low Water Pressure / Irregular Supply</option>
              <option value="FallenTrees">Fallen Trees / Broken Branches</option>
              <option value="UnmaintainedParks">Unmaintained Parks / Broken Benches</option>
              <option value="WeedsMosquitoes">Overgrown Weeds / Mosquito Breeding</option>
              <option value="IllegalTreeCutting">Illegal Cutting of Trees</option>
              <option value="IllegalParking">Illegal Parking</option>
              <option value="MissingSigns">Damaged / Missing Road Signs</option>
              <option value="SpeedBreaker">Broken Speed Breakers / Faded Zebra Crossing</option>
              <option value="EncroachedBusStops">Encroached Bus / Auto Stops</option>
              <option value="MosquitoBreeding">Mosquito Breeding Areas</option>
              <option value="StrayAnimals">Stray Animals (Dogs, Cattle, etc.)</option>
              <option value="GarbageBurning">Open Burning of Garbage (Air Pollution)</option>
              <option value="NoisePollution">Noise Pollution</option>
              <option value="Other">Other Infrastructure Issues</option>
            </select>
            <small id="category-help" className="field-help">
              Choose the category that best describes your issue
            </small>
          </label>

          {/* Title */}
          <label className="field">
            <span className="field-label">
              Issue Title <span className="required" aria-label="required">*</span>
            </span>
            <input
              type="text"
              className={`input ${!formValidation.isTitleValid && formTouched.title ? "input-error" : ""}`}
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setFormTouched(prev => ({ ...prev, title: true }));
              }}
              onBlur={() => setFormTouched(prev => ({ ...prev, title: true }))}
              placeholder="e.g., Large pothole causing traffic hazard"
              required
              minLength={10}
              maxLength={100}
              aria-describedby="title-help title-counter"
            />
            <div className="field-meta">
              <small id="title-help" className="field-help">
                Provide a clear, descriptive title (minimum 10 characters)
              </small>
              <small id="title-counter" className={`char-counter ${title.length >= 100 ? "limit-reached" : ""}`}>
                {title.length}/100
              </small>
            </div>
          </label>

          {/* Location */}
          <label className="field">
            <span className="field-label">
              Location <span className="required" aria-label="required">*</span>
            </span>
            <input
              type="text"
              className={`input ${!formValidation.isLocationValid && formTouched.location ? "input-error" : ""}`}
              id="location-input"
              name="location"
              value={locationText}
              onChange={(e) => {
                setLocationText(e.target.value);
                setFormTouched(prev => ({ ...prev, location: true }));
              }}
              onBlur={() => setFormTouched(prev => ({ ...prev, location: true }))}
              placeholder="e.g., Main Street near City Hall, or search/click on map"
              required
              aria-describedby="location-help"
            />
            
            {/* Address Search Suggestions */}
            {locationText && !coords.lat && (
              <div className="address-search-note">
                <small className="field-help">
                  💡 Tip: Click on the map below or use "Use My Location" for automatic address detection
                </small>
              </div>
            )}
            
            <div className="map-container">
              <MapPicker 
                onLocationSelect={handleMapLocationSelect}
                currentLocation={coords}
                isLoaded={isMapLoaded}
                onMapLoad={setIsMapLoaded}
              />
              {isMapLoaded && (
                <div className="map-controls">
                  <button
                    type="button"
                    className="btn secondary small"
                    onClick={useCurrentLocation}
                    disabled={loadingLocation}
                    aria-label="Use current location"
                  >
                    {loadingLocation ? (
                      <>
                        <span className="loading-spinner" aria-hidden="true"></span>
                        Getting location...
                      </>
                    ) : (
                      <>
                        📍 Use My Location
                      </>
                    )}
                  </button>
                  <small className="map-note">
                    Click on the map to set a pin or drag the marker to adjust. The address will be automatically detected.
                  </small>
                </div>
              )}
            </div>
            <small id="location-help" className="field-help">
              Provide the exact location or address of the issue. Click on the map or use GPS for automatic address detection.
            </small>
          </label>

          {/* Description */}
          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              className="input textarea"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail, including any safety concerns..."
              rows={4}
              maxLength={500}
              aria-describedby="description-help description-counter"
            />
            <div className="field-meta">
              <small id="description-help" className="field-help">
                Provide additional details to help resolve the issue faster
              </small>
              <small id="description-counter" className={`char-counter ${description.length >= 500 ? "limit-reached" : ""}`}>
                {description.length}/500
              </small>
            </div>
          </label>

          {/* Photo Upload */}
          <div className="field">
            <span className="field-label">Photo Evidence</span>
            
            {/* Camera view when active */}
            {showCamera ? (
              <div className="camera-container">
                <div className="camera-preview">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="camera-video"
                  />
                </div>
                <div className="camera-controls">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={stopCamera}
                    aria-label="Close camera"
                  >
                    Close Camera
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={capturePhoto}
                    aria-label="Capture photo"
                  >
                    Capture Photo
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`photo-upload ${isDragOver ? "drag-over" : ""} ${photoPreview ? "has-photo" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                aria-label="Upload photo by clicking, dragging, or using camera"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    document.getElementById('photo-input')?.click();
                  }
                }}
              >
                <input
                  type="file"
                  id="photo-input"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={onFileChange}
                  style={{ display: "none" }}
                  aria-describedby="photo-help"
                />
                
                  {photoPreview ? (
                    <div className="photo-preview">
                      {previewIsVideo ? (
                        <video src={photoPreview} controls playsInline className="preview-video" />
                      ) : (
                        <img src={photoPreview} alt="Issue preview" />
                      )}
                      <div className="photo-overlay">
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhoto(null);
                            setPhotoPreview(null);
                            setPreviewIsVideo(false);
                            if (objectUrlRef.current) {
                              URL.revokeObjectURL(objectUrlRef.current);
                              objectUrlRef.current = null;
                            }
                          }}
                          aria-label="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                  <div
                    className="upload-placeholder"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('photo-input')?.click();
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('photo-input')?.click();
                      }
                    }}
                  >
                    <div className="upload-icon" aria-hidden="true">📷</div>
                    <div className="upload-text">
                      <strong>Click to upload</strong> or drag and drop
                    </div>
                    <div className="upload-formats">JPEG, PNG, WebP (max 10MB)</div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn secondary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            startCamera();
                          }}
                          aria-label="Use camera"
                        >
                          Use Camera
                        </button>
                        <button
                          type="button"
                          className="btn secondary small"
                          onClick={(e) => { e.stopPropagation(); document.getElementById('photo-input')?.click(); }}
                          aria-label="Upload media"
                        >
                          Upload Media
                        </button>
                      </div>
                  </div>
                )}
              </div>
            )}
            <small id="photo-help" className="field-help">
              Adding a photo helps authorities understand and address the issue faster
            </small>
          
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate(-1)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={!formValidation.canSubmit || submitting}
              aria-describedby="submit-help"
            >
              {submitting ? (
                <>
                  <span className="loading-spinner" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
          <small id="submit-help" className="field-help">
            {!formValidation.canSubmit 
              ? "Please fill in all required fields to submit" 
              : "Your report will be reviewed by the relevant department"
            }
          </small>
        </form>
        </div>
      </div>
    </div>
  );
}

// Enhanced MapPicker Component with Google Maps Integration
function MapPicker({ onLocationSelect, currentLocation, isLoaded, onMapLoad }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const [mapError, setMapError] = useState("");

  const placeMarkerAndGeocode = useCallback((latLng) => {
    if (!markerRef.current || !mapRef.current || !geocoderRef.current) return;

    markerRef.current.setPosition(latLng);
    markerRef.current.setVisible(true);
    mapRef.current.panTo(latLng);

    const lat = latLng.lat();
    const lng = latLng.lng();

    geocoderRef.current.geocode({ 
      location: latLng,
      result_type: ['street_address', 'route', 'neighborhood', 'locality']
    }, (results, status) => {
      let address = `Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      if (status === "OK" && results && results.length > 0) {
        let bestAddress = null;
        const addressTypes = ['street_address', 'route', 'neighborhood', 'locality', 'sublocality'];
        for (const result of results) {
          for (const preferredType of addressTypes) {
            if (result.types.includes(preferredType)) {
              bestAddress = result.formatted_address;
              break;
            }
          }
          if (bestAddress) break;
        }
        if (!bestAddress && results[0]) bestAddress = results[0].formatted_address;
        if (bestAddress) {
          const addressParts = bestAddress.split(',');
          if (addressParts.length > 3) bestAddress = addressParts.slice(0, 3).join(',').trim();
          address = bestAddress;
        }
      }
      onLocationSelect({ lat, lng, address });
    });
  }, [onLocationSelect]);

  const initializeMap = useCallback(() => {
    if (!window.google || !containerRef.current) return;
    
    geocoderRef.current = new window.google.maps.Geocoder();
    
    // Default center (Ahmedabad, Gujarat)
    const defaultCenter = { lat: 23.0225, lng: 72.5714 };
    
    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER
      },
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    markerRef.current = new window.google.maps.Marker({
      map: mapRef.current,
      draggable: true,
      visible: false,
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="9" r="2.5" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
      }
    });

    // Map click listener
    mapRef.current.addListener("click", (event) => {
      placeMarkerAndGeocode(event.latLng);
    });

    // Marker drag listener
    markerRef.current.addListener("dragend", () => {
      const position = markerRef.current.getPosition();
      placeMarkerAndGeocode(position);
    });
  }, [placeMarkerAndGeocode]);

  useEffect(() => {
    let canceled = false;
    async function loadMap() {
      // Helper to initialize Leaflet fallback (clears container and loads assets)
      async function initLeafletFallback() {
        try {
          if (!containerRef.current) return;
          // Clear container to remove Google Maps overlay
          containerRef.current.innerHTML = '';
          if (!document.querySelector('link[data-leaflet]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            link.setAttribute('data-leaflet', '1');
            document.head.appendChild(link);
          }

          if (!window.L) {
            await new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
              s.async = true;
              s.onload = resolve;
              s.onerror = () => reject(new Error('Failed to load Leaflet JS'));
              document.body.appendChild(s);
            });
          }

          if (canceled || !containerRef.current || !window.L) return;

          const L = window.L;
          const defaultCenter = [23.0225, 72.5714];
          const map = L.map(containerRef.current).setView(defaultCenter, 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          const marker = L.marker(defaultCenter, { draggable: true }).addTo(map).bindPopup('Drag to adjust location');

          function placeMarkerAndNotify(latlng) {
            marker.setLatLng(latlng);
            marker.openPopup();
            map.panTo(latlng);
            const lat = latlng.lat || latlng[0];
            const lng = latlng.lng || latlng[1];
            onLocationSelect({ lat, lng, address: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}` });
          }

          map.on('click', (e) => placeMarkerAndNotify(e.latlng));
          marker.on('dragend', () => placeMarkerAndNotify(marker.getLatLng()));

          if (currentLocation && currentLocation.lat && currentLocation.lng) {
            const pos = [currentLocation.lat, currentLocation.lng];
            marker.setLatLng(pos);
            map.setView(pos, 16);
          }

          onMapLoad?.(true);
        } catch (leafletError) {
          console.error('Leaflet fallback failed:', leafletError);
          setMapError('Failed to load map. Please check your internet connection.');
        }
      }

      try {
        // Clear container first to avoid leftover overlays
        if (containerRef.current) containerRef.current.innerHTML = '';
        await loadGoogleMapsScript();
        if (canceled) return;
        // Attempt to initialize Google Maps
        try {
          initializeMap();
        } catch (initErr) {
          console.error('initializeMap threw:', initErr);
          // initializeMap failed — use Leaflet fallback
          await initLeafletFallback();
          return;
        }

        // Wait briefly, then check for Google error overlay elements inside the container
        await new Promise((r) => setTimeout(r, 600));
        if (canceled) return;
        try {
          const container = containerRef.current;
          const gmErr = container && container.querySelector && (container.querySelector('.gm-err-container') || container.querySelector('[data-attr="gm-err"]') );
          const containsOops = container && container.innerText && container.innerText.includes('Oops! Something went wrong');
          if (gmErr || containsOops) {
            console.warn('Detected Google Maps error overlay; switching to Leaflet fallback');
            await initLeafletFallback();
            return;
          }
        } catch (checkErr) {
          console.warn('Error checking for Google Maps overlay:', checkErr);
        }

        onMapLoad?.(true);
      } catch (error) {
        console.error("Google Maps failed to load:", error);
        // Fallback to Leaflet when Google Maps fails to load or auth fails
        await initLeafletFallback();
      }
    }

    loadMap();
    return () => { canceled = true; };
  }, [onMapLoad, initializeMap]);

  useEffect(() => {
    if (currentLocation.lat && currentLocation.lng && mapRef.current && markerRef.current) {
      const position = new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng);
      mapRef.current.setCenter(position);
      mapRef.current.setZoom(16);
      markerRef.current.setPosition(position);
      markerRef.current.setVisible(true);
    }
  }, [currentLocation]);

  

  
  if (mapError) {
    return (
      <div className="map-error">
        <div className="error-icon" aria-hidden="true">🗺️</div>
        <p>{mapError}</p>
        <button 
          type="button" 
          className="btn secondary small"
          onClick={() => {
            setMapError("");
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <div 
        ref={containerRef} 
        className="map-container-inner"
        style={{ 
          width: "100%", 
          height: "300px", 
          borderRadius: "12px",
          border: "1px solid var(--border)",
          overflow: "hidden"
        }}
        aria-label="Interactive map for selecting location"
      />
      {!isLoaded && (
        <div className="map-loading">
          <div className="loading-spinner" aria-hidden="true"></div>
          <span>Loading map...</span>
        </div>
      )}
    </div>
  );
}

