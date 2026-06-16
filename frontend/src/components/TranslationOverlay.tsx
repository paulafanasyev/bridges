import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { User, Language } from '../types';
import { mockApi } from '../services/mockApi';

interface TranslationOverlayProps {
  currentUser: User;
  otherUser: User;
  isCallActive: boolean;
}

interface TranslationMessage {
  id: string;
  text: string;
  translated: string;
  from: string;
  isUser: boolean;
  timestamp: number;
}

export default function TranslationOverlay({ currentUser, otherUser, isCallActive }: TranslationOverlayProps) {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState<TranslationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Web Speech API for speech recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang === 'zh' ? 'zh-CN' : lang === 'ru' ? 'ru-RU' : 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');

      if (event.results[event.results.length - 1].isFinal) {
        const targetLang: Language = currentUser.preferred_language === lang
          ? otherUser.preferred_language
          : currentUser.preferred_language;
        
        // Simulate translation
        const translated = `[${lang}→${targetLang}] ${transcript}`;
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          text: transcript,
          translated,
          from: lang,
          isUser: true,
          timestamp: Date.now(),
        }]);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    
    const targetLang: Language = currentUser.preferred_language === lang
      ? otherUser.preferred_language
      : currentUser.preferred_language;

    try {
      const translated = translationEnabled
        ? await mockApi.translateText(inputText, lang, targetLang)
        : inputText;

      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        text: inputText,
        translated,
        from: lang,
        isUser: true,
        timestamp: Date.now(),
      }]);
      setInputText('');
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-sm) var(--space-md)',
        background: 'var(--color-navBg)',
        color: 'var(--color-navText)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>
          {t('call.translationOverlay')}
        </span>
        <button
          onClick={() => setTranslationEnabled(!translationEnabled)}
          className="btn btn-sm"
          style={{
            background: translationEnabled ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)',
            color: translationEnabled ? '#27ae60' : '#e74c3c',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          {translationEnabled ? '🔄 ' + t('call.translationOn') : '🚫 ' + t('call.translationOff')}
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm)',
      }}>
        {messages.length === 0 && isCallActive && (
          <div style={{
            textAlign: 'center',
            color: 'var(--color-textSecondary)',
            padding: 'var(--space-xl)',
            fontSize: 'var(--font-size-sm)',
          }}>
            {t('call.translationNote')}
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
          }}>
            <div style={{
              background: msg.isUser ? 'var(--color-gradient)' : 'var(--color-background)',
              color: msg.isUser ? 'white' : 'var(--color-text)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: msg.isUser
                ? 'var(--radius-md) var(--radius-md) var(--radius-sm) var(--radius-md)'
                : 'var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
            }}>
              <div>{msg.text}</div>
              {translationEnabled && msg.translated && (
                <div style={{
                  marginTop: 4,
                  paddingTop: 4,
                  borderTop: `1px solid ${msg.isUser ? 'rgba(255,255,255,0.3)' : 'var(--color-border)'}`,
                  fontSize: 'var(--font-size-xs)',
                  opacity: 0.9,
                }}>
                  {msg.translated}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: 'var(--space-sm) var(--space-md)',
        borderTop: `1px solid var(--color-border)`,
        display: 'flex',
        gap: 'var(--space-sm)',
        alignItems: 'center',
      }}>
        <button
          onClick={toggleListening}
          className="btn btn-icon"
          style={{
            background: isListening ? '#e74c3c' : 'var(--color-background)',
            color: isListening ? 'white' : 'var(--color-text)',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
        >
          🎤
        </button>
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendText()}
          placeholder={t('call.typeHere')}
          style={{ flex: 1 }}
        />
        <button
          onClick={handleSendText}
          className="btn btn-icon btn-primary"
          style={{ flexShrink: 0 }}
        >
          ➡️
        </button>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div style={{
          textAlign: 'center',
          padding: '4px var(--space-md)',
          background: '#e74c3c',
          color: 'white',
          fontSize: 'var(--font-size-xs)',
          animation: 'pulse 1.5s ease infinite',
        }}>
          🎤 {t('call.speaking')}
        </div>
      )}
    </div>
  );
}