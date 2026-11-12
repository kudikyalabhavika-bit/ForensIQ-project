
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BrainCircuit,
  Search,
  UserRound,
  CheckCircle2,
  XCircle,
  CircleHelp,
  AlertCircle,
  LoaderCircle,
  ArrowRight,
  RotateCcw,
  Mic,
  Square,
  Trash2,
} from 'lucide-react'

import { searchSuspects, imageSrc } from '../services/dbApi'
import '../styles/nlpIdentification.css'

const formatLabel = (value) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const formatValue = (value) => {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function NLPSuspectIdentification() {
  const navigate = useNavigate()

  const [description, setDescription] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('idle')

  const recognitionRef = useRef(null)
  const voiceBaseDescriptionRef = useRef('')
  const finalTranscriptRef = useRef('')

  const startVoiceRecording = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError(
        'Speech recognition is not supported. Please use Google Chrome.'
      )
      setVoiceStatus('error')
      return
    }

    if (recognitionRef.current) return

    setVoiceError('')
    setVoiceStatus('connecting')

    voiceBaseDescriptionRef.current = description.trim()
    finalTranscriptRef.current = ''

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-IN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return

      setIsListening(true)
      setVoiceStatus('listening')
      setVoiceError('')
    }

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return

      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const spokenText = result[0]?.transcript || ''

        if (result.isFinal) {
          finalTranscriptRef.current += spokenText + ' '
        } else {
          interimTranscript += spokenText
        }
      }

      const baseText = voiceBaseDescriptionRef.current
      const finalText = finalTranscriptRef.current.trim()
      const liveText = interimTranscript.trim()

      const combinedTranscript = [finalText, liveText]
        .filter(Boolean)
        .join(' ')

      const updatedDescription = [baseText, combinedTranscript]
        .filter(Boolean)
        .join(' ')

      setDescription(updatedDescription.slice(0, 2000))
      setVoiceStatus('listening')
    }

    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return

      setIsListening(false)
      setVoiceStatus('error')

      const errorMessages = {
        'no-speech':
          'No speech detected. Speak clearly after clicking Speak.',
        'not-allowed':
          'Microphone permission denied. Allow microphone access in Chrome.',
        'audio-capture':
          'Chrome cannot detect your microphone. Check your input device.',
        network:
          'Speech recognition network error. Check your internet connection.',
        aborted:
          'Voice recognition was interrupted. Please try again.',
        'service-not-allowed':
          'Chrome speech recognition service is unavailable.',
      }

      setVoiceError(
        errorMessages[event.error] ||
          `Voice recognition error: ${event.error}`
      )
    }

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return

      recognitionRef.current = null
      setIsListening(false)

      setVoiceStatus((current) =>
        current === 'error' ? 'error' : 'idle'
      )
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      recognitionRef.current = null
      setIsListening(false)
      setVoiceStatus('error')
      setVoiceError(
        'Could not start voice recognition. Wait a moment and try again.'
      )
    }
  }

  const stopVoiceRecording = () => {
    const recognition = recognitionRef.current

    recognitionRef.current = null

    if (recognition) {
      try {
        recognition.stop()
      } catch (err) {
        console.warn('Unable to stop recognition:', err)
      }
    }

    setIsListening(false)
    setVoiceStatus('idle')
  }

  const handleClearVoiceText = () => {
    stopVoiceRecording()
    voiceBaseDescriptionRef.current = ''
    finalTranscriptRef.current = ''
    setDescription('')
    setVoiceError('')
    setVoiceStatus('idle')
  }

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!description.trim()) {
      setError('Please enter a suspect description.')
      setResults(null)
      return
    }

    if (description.length > 2000) {
      setError('Description must be under 2000 characters.')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const data = await searchSuspects(description.trim())
      setResults(data)
    } catch (err) {
      setError(err.message || 'Unable to search suspects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    stopVoiceRecording()
    voiceBaseDescriptionRef.current = ''
    finalTranscriptRef.current = ''
    setDescription('')
    setResults(null)
    setError('')
    setVoiceError('')
    setVoiceStatus('idle')
  }

  return (
    <div className="nlp-page">
      <div className="nlp-header">
        <div className="nlp-header-icon">
          <BrainCircuit size={27} />
        </div>

        <div>
          <h1>NLP Suspect Identification</h1>
          <p>
            Analyse witness descriptions and find profiles with matching
            physical attributes.
          </p>
        </div>
      </div>

      <form className="nlp-search-card" onSubmit={handleSearch}>
        <div className="nlp-section-heading">
          <Search size={20} />
          <h2>Enter Suspect Description</h2>
        </div>

        <p className="nlp-helper-text">
          Describe the suspect's appearance in natural language. Include
          details such as age, gender, face shape, eyes, hair and other
          physical features. Type your description or use voice input.
        </p>

        <div className={`nlp-voice-box ${isListening ? 'voice-active' : ''}`}>
          <textarea
            className="nlp-description-input"
            placeholder="Describe the suspect's age, gender, face shape, eyes, hair and other visible features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={7}
          />

          <div className="nlp-voice-box-footer">
            <span className="nlp-voice-status">
              {voiceStatus === 'connecting'
                ? 'Connecting to microphone...'
                : isListening
                  ? 'Listening... Speak clearly'
                  : voiceStatus === 'error'
                    ? 'Voice input stopped'
                    : 'Type your description or use voice input'}
            </span>

            <div className="nlp-voice-actions">
              <button
                type="button"
                className="nlp-clear-text-button"
                onClick={handleClearVoiceText}
                disabled={!description && !isListening && !voiceError}
              >
                <Trash2 size={15} />
                Clear Text
              </button>

              <button
                type="button"
                className={`nlp-inline-mic ${isListening ? 'mic-active' : ''}`}
                onClick={
                  isListening ? stopVoiceRecording : startVoiceRecording
                }
                disabled={loading || voiceStatus === 'connecting'}
                aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                title={isListening ? 'Stop voice input' : 'Start voice input'}
              >
                {voiceStatus === 'connecting' ? (
                  <LoaderCircle className="nlp-spinner" size={19} />
                ) : isListening ? (
                  <Square size={17} fill="currentColor" />
                ) : (
                  <Mic size={19} />
                )}

                <span>{isListening ? 'Stop' : 'Speak'}</span>
              </button>
            </div>
          </div>

          {voiceError && (
            <div className="nlp-voice-error">
              <AlertCircle size={17} />
              <span>{voiceError}</span>
            </div>
          )}
        </div>

        <div className="nlp-input-footer">
          <span>{description.length}/2000 characters</span>

          <div className="nlp-form-actions">
            <button
              type="button"
              className="nlp-reset-button"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw size={15} />
              Clear
            </button>

            <button
              type="submit"
              className="nlp-search-button"
              disabled={loading || isListening}
            >
              {loading ? (
                <>
                  <LoaderCircle className="nlp-spinner" size={18} />
                  Analysing...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Find Suspects
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="nlp-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
      </form>

      {results && (
        <div className="nlp-results-section">
          <div className="nlp-results-heading">
            <div>
              <h2>Analysis Results</h2>
              <p>{results.message}</p>
            </div>

            <span className="nlp-results-count">
              {results.matches?.length || 0} Matches
            </span>
          </div>

          {Object.keys(results.extracted_attributes || {}).length > 0 && (
            <div className="nlp-attributes-card">
              <h3>
                <BrainCircuit size={19} />
                Extracted Attributes
              </h3>

              <div className="nlp-attribute-list">
                {Object.entries(results.extracted_attributes).map(
                  ([key, value]) => (
                    <div className="nlp-attribute-chip" key={key}>
                      <span>{formatLabel(key)}</span>
                      <strong>{formatValue(value)}</strong>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {results.matches?.length > 0 ? (
            <div className="nlp-match-list">
              {results.matches.map((match, index) => (
                <div className="nlp-match-card" key={match.id}>
                  <div className="nlp-match-top">
                    <div className="nlp-match-person">
                      {match.thumbnail ? (
                        <img
                          className="nlp-profile-image"
                          src={imageSrc(match.thumbnail)}
                          alt={match.name || 'Suspect profile'}
                        />
                      ) : (
                        <div className="nlp-profile-placeholder">
                          <UserRound size={28} />
                        </div>
                      )}

                      <div>
                        <span className="nlp-rank">
                          RANK #{index + 1}
                        </span>
                        <h3>{match.name || 'Unknown Profile'}</h3>
                        <p>
                          {match.profile_code || 'No profile code'}
                          {match.age != null ? ` • ${match.age} years` : ''}
                          {match.gender ? ` • ${match.gender}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="nlp-similarity">
                      <strong>{match.similarity}%</strong>
                      <span>Attribute Similarity</span>
                    </div>
                  </div>

                  <div className="nlp-comparison">
                    <div className="nlp-comparison-group matched">
                      <h4>
                        <CheckCircle2 size={16} />
                        Matched
                      </h4>
                      <p>
                        {match.matched_attributes?.length
                          ? match.matched_attributes.map(formatLabel).join(', ')
                          : 'No matching attributes'}
                      </p>
                    </div>

                    <div className="nlp-comparison-group mismatched">
                      <h4>
                        <XCircle size={16} />
                        Mismatched
                      </h4>
                      <p>
                        {match.mismatched_attributes?.length
                          ? match.mismatched_attributes.map(formatLabel).join(', ')
                          : 'No mismatched attributes'}
                      </p>
                    </div>

                    <div className="nlp-comparison-group unavailable">
                      <h4>
                        <CircleHelp size={16} />
                        Unavailable
                      </h4>
                      <p>
                        {match.unavailable_attributes?.length
                          ? match.unavailable_attributes.map(formatLabel).join(', ')
                          : 'No unavailable attributes'}
                      </p>
                    </div>
                  </div>

                  <div className="nlp-match-footer">
                    <span>
                      {match.compared_attributes || 0} attributes compared
                    </span>

                    <button
                      type="button"
                      className="nlp-profile-button"
                      onClick={() =>
                        navigate(`/criminal-profile/${match.id}`)
                      }
                    >
                      View Profile
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="nlp-empty-state">
              <AlertCircle size={28} />
              <h3>No suspect matches found</h3>
              <p>
                {results.message ||
                  'Try adding more physical details to the description.'}
              </p>
            </div>
          )}

          <p className="nlp-disclaimer">
            Note: Similarity scores are based on available database attributes.
            They are investigative leads, not confirmation of a person's
            identity.
          </p>
        </div>
      )}
    </div>
  )
}

export default NLPSuspectIdentification
