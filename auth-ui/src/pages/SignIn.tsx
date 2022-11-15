import {
    Anchor,
    Button,
    Container,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { AuthClient } from "../api";
import { AxiosError } from "axios";

export function SignIn() {
    const loginForm = useForm({
        initialValues: { username: "", password: "" },
        validate: {
            username: (value) => {
                if (value.trim() === "") {
                    return "Username field cannot be blank";
                }
                return null;
            },
            password: (value) => {
                if (value.trim() === "") {
                    return "Password field cannot be blank";
                }
                return null;
            },
        },
    });

    async function onSignIn(values: any) {
        const data = {
            username: values.username,
            password: values.password,
        };

        try {
            const response = await AuthClient.post("/api/auth/sign_in", data);

            if (response.status === 200) {
                console.log("redirect to home page");
            }
        } catch (error: unknown | AxiosError) {
            if (error instanceof AxiosError && error?.response) {
                if (error?.response.status === 401) {
                    console.error("Error: Username or password error");
                } else {
                    console.error("Error: ", error);
                }
            } else {
                console.error("Error: ", error);
            }
        }
    }

    return (
        <Container size={520} my={80}>
            <Paper withBorder p={30} mt={30} shadow="md">
                <Text size="lg" weight={500} align="center">
                    Welcome, Login
                </Text>

                <Group grow mb="md" mt="md">
                    <Button variant="default" color="gray">
                        Google
                    </Button>
                    <Button variant="default" color="gray">
                        Facebook
                    </Button>
                </Group>

                <Divider
                    label="Or continue with username"
                    labelPosition="center"
                    my="lg"
                />

                <form
                    onSubmit={loginForm.onSubmit(
                        async (values) => await onSignIn(values)
                    )}
                >
                    <Stack>
                        <TextInput
                            required
                            label="Username"
                            placeholder="Your username"
                            {...loginForm.getInputProps("username")}
                        />
                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            {...loginForm.getInputProps("password")}
                        />
                    </Stack>

                    <Group position="apart" mt="xl">
                        <Anchor
                            component="button"
                            type="button"
                            color="dimmed"
                            size="xs"
                        >
                            Don't have an account? Register
                        </Anchor>
                        <Button type="submit">Sign In</Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}
