import React from "react";
import Routings from "../utils/Routings";
import usePageTracking from "./hooks/usePageTracking";

const App = () => {
    usePageTracking();

    return (
        <div>
            <Routings />
        </div>
    );
};

export default App;