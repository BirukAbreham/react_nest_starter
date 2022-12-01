import {
    Alert,
    Anchor,
    Button,
    Container,
    Divider,
    Group,
    LoadingOverlay,
    Paper,
    PasswordInput,
    Space,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { AxiosError } from "axios";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { requestSignedUser, requestSignIn, useAppDispatch } from "../store";

export function SignIn() {
    // react router related
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    // react redux related
    const dispatch = useAppDispatch();

    const [loading, setLoading] = useState<boolean>(false);
    const [loginErrors, setLoginErrors] = useState<string[]>([]);
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

        setLoading(true);

        try {
            const response: any = await dispatch(requestSignIn(data)).unwrap();

            if (response?.status === 200) {
                setLoading(false);

                await getSignedInUser(data.username);

                // redirect the user to authentication required page
                navigate(from, { replace: true });
            }
        } catch (error: unknown | AxiosError) {
            setLoading(false);
            if (
                error instanceof AxiosError &&
                error?.response &&
                error?.response.status === 401
            ) {
                let message = "Given username or password is incorrect";
                setLoginErrors([message]);
            } else {
                setLoginErrors(["Login failed with unexpected error"]);
            }
        }
    }

    async function getSignedInUser(username: string) {
        try {
            const response: any = await dispatch(
                requestSignedUser(username)
            ).unwrap();

            if (response?.status) {
            }
        } catch (error) {
            setLoginErrors(["Login failed with unexpected error"]);
        }
    }

    const errors = loginErrors.length ? (
        <Group grow>
            <Alert title="Error" color="red">
                {loginErrors.map((message, idx) => (
                    <div key={idx}>
                        <Text>{message}</Text>
                        <br />
                    </div>
                ))}
            </Alert>
        </Group>
    ) : null;

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
                    label="Or continue with"
                    labelPosition="center"
                    my="lg"
                />

                <form
                    onSubmit={loginForm.onSubmit(
                        async (values) => await onSignIn(values)
                    )}
                >
                    <LoadingOverlay visible={loading} overlayBlur={1} />
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

                    <Space h="md" />
                    {errors}

                    <Group position="apart" mt="xl">
                        <Link to="/sign_up">
                            <Anchor
                                component="button"
                                type="button"
                                color="dimmed"
                                size="xs"
                            >
                                Don't have an account? Sign up
                            </Anchor>
                        </Link>
                        <Button type="submit">Sign In</Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}
