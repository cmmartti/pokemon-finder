import {HookRouter, useRoutes, navigate} from 'hookrouter';

export const languages = [
    {id: 'de', label: 'de - Deutsch'},
    {id: 'en', label: 'en - English'},
    {id: 'fr', label: 'fr - français'},
    {id: 'ja', label: 'ja - 日本語'},
    {id: 'ko', label: 'ko - 한국어'},
];

const routes: HookRouter.RouteObject = {};
for (const {id} of languages) {
    routes[`/${id}`] = () => id;
}

function setLanguage(language: string) {
    navigate(`/${language}`);
    localStorage.setItem('language', language);
}

type Return = [string, (language: string) => void];

export default function useLanguage(_default: string): Return {
    let language = useRoutes(routes) || localStorage.getItem('language') || _default;
    setLanguage(language);
    return [language, setLanguage];
}
