import { Routes, Route } from "react-router-dom";
import { RequireAuth } from "./components";
import { Home, NotFound404, SignIn, SignUp } from "./pages";
import { Layout } from "./pages/Layout";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* public routes */}
                <Route path="sign_in" element={<SignIn />} />
                <Route path="sign_up" element={<SignUp />} />

                {/* we want to protect these routes */}
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<Home />} />
                </Route>

                {/* catch all other routes */}
                <Route path="*" element={<NotFound404 />} />
            </Route>
        </Routes>
    );
}

export default App;
