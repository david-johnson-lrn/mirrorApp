import { useEffect, useState } from "react";
import { QuizListener } from "../utils/ItemApiListener";

export const useExternalScript = (url) => {

    let [state, setState] = useState(url ? "loading" : "idle");

    useEffect(() => {
        if (!url) {
            setState("idle");
            return;
        }
        let script = document.querySelector(`script[src="${url}"]`);

        const handleScript = (e) => {
            setState(e.type === "load" ? true : false);
        };

        if (!script) {
            //dynamically adding script to page
            script = document.createElement("script");
            script.type = "application/javascript";
            script.src = url;
            script.async = true;
            document.body.appendChild(script);
            script.addEventListener("load", handleScript);
            script.addEventListener("error", handleScript);
        }

        script.addEventListener("load", handleScript);
        script.addEventListener("error", handleScript);


        return () => {
            script.removeEventListener("load", handleScript);
            script.removeEventListener("error", handleScript);
        };

    }, [url]);

    return state;
};