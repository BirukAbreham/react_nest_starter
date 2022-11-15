import { MantineProvider } from "@mantine/core";
import { SignIn, SignUp } from "./pages";

function App() {
    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <SignIn />
        </MantineProvider>
    );
}

export default App;
