import { useEffect, useMemo, useRef } from 'react';

const TELEGRAM_WIDGET_SRC = 'https://telegram.org/js/telegram-widget.js?22';

const TelegramLoginButton = ({ onAuth, disabled = false }) => {
    const containerRef = useRef(null);
    const onAuthRef = useRef(onAuth);
    const callbackName = useMemo(
        () => `telegramAuthCallback_${Math.random().toString(36).slice(2)}`,
        []
    );
    const botUsername = (import.meta.env.VITE_TELEGRAM_BOT_USERNAME || '').replace('@', '').trim();

    useEffect(() => {
        onAuthRef.current = onAuth;
    }, [onAuth]);

    useEffect(() => {
        if (!botUsername || !containerRef.current) return;

        window[callbackName] = async (user) => {
            if (typeof onAuthRef.current === 'function') {
                await onAuthRef.current(user);
            }
        };

        const script = document.createElement('script');
        script.src = TELEGRAM_WIDGET_SRC;
        script.async = true;
        script.setAttribute('data-telegram-login', botUsername);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '12');
        script.setAttribute('data-request-access', 'write');
        script.setAttribute('data-userpic', 'false');
        script.setAttribute('data-onauth', `${callbackName}(user)`);

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
            delete window[callbackName];
        };
    }, [botUsername, callbackName]);

    if (!botUsername) return null;

    return (
        <div className={`relative w-full ${disabled ? 'opacity-60' : ''}`}>
            <div
                ref={containerRef}
                className="w-full flex justify-center"
            />
            {disabled && <div className="absolute inset-0 cursor-not-allowed" aria-hidden="true" />}
        </div>
    );
};

export default TelegramLoginButton;
