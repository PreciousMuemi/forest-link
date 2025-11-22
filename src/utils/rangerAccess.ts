const getEnvAllowedEmails = (): string[] => {
    const envValue = import.meta.env.VITE_RANGER_ALLOWED_EMAILS as string | undefined;
    const fallback = 'ranger-demo@example.com,admin@example.com';
    return (envValue || fallback)
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
};

const allowedEmails = getEnvAllowedEmails();

export const isRangerAccessEmail = (email?: string | null): boolean => {
    if (!email) return false;
    return allowedEmails.includes(email.toLowerCase());
};
