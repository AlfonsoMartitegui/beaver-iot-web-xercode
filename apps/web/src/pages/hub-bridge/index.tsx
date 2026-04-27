import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { iotLocalStorage, TOKEN_CACHE_KEY } from '@milesight/shared/src/utils/storage';
import { globalAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';

export default () => {
    const navigate = useNavigate();
    const consumedRef = useRef(false);
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        if (consumedRef.current) return;
        consumedRef.current = true;

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        window.history.replaceState(null, document.title, window.location.pathname);

        const exchangeSession = async () => {
            if (!code) {
                setErrorMessage('Missing HUB sign-in code. Please sign in again.');
                return;
            }

            const [error, resp] = await awaitWrap(globalAPI.hubSessionExchange({ code }));
            const respData = getResponseData(resp);

            if (error || !respData || !isRequestSuccess(resp)) {
                setErrorMessage('Unable to sign in from HUB. Please sign in again.');
                return;
            }

            const result = { ...respData, expires_in: Date.now() + 60 * 60 * 1000 };

            iotLocalStorage.setItem(TOKEN_CACHE_KEY, result);
            navigate('/', { replace: true });
        };

        exchangeSession();
    }, [navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
            }}
        >
            <Stack spacing={2} alignItems="center">
                {!errorMessage ? (
                    <>
                        <CircularProgress size={32} />
                        <Typography variant="body1">Signing in...</Typography>
                    </>
                ) : (
                    <>
                        <Alert severity="error">{errorMessage}</Alert>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/auth/login', { replace: true })}
                        >
                            Go to login
                        </Button>
                    </>
                )}
            </Stack>
        </Box>
    );
};
