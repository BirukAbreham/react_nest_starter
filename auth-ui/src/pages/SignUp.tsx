import {
    Alert,
    Anchor,
    Button,
    Container,
    Divider,
    Group,
    Loader,
    LoadingOverlay,
    Paper,
    PasswordInput,
    Space,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { AuthClient } from "../api";
import { AxiosError } from "axios";

const EMAIL_REGEX =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const PASSWORD_REGEX = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export function SignUp() {
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState<string[]>([]);

    const registrationForm = useForm({
        initialValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },

        validate: {
            username: (value) => {
                if (value.length < 4) {
                    return "Username field length is below minimum length of four";
                }
                if (value.length > 40) {
                    return "Username field exceeds maximum length of forty";
                }
                return null;
            },
            email: (value) => {
                if (EMAIL_REGEX.test(value)) {
                    return null;
                }
                return "Email field is not in proper email format";
            },
            password: (value) => {
                if (PASSWORD_REGEX.test(value)) {
                    return null;
                }
                return "Password field should be strong, don't use common passwords and use character combinations";
            },
            confirmPassword: (value, values) => {
                if (value !== values.password) {
                    return "Password confirmation is not the same as the password";
                }
                return null;
            },
        },
    });

    async function onRegister(values: any) {
        const data = {
            username: values.username,
            email: values.email,
            password: values.password,
            password_confirmed: values.confirmPassword,
        };

        setLoading(true);

        try {
            const response = await AuthClient.post("/api/auth/sign_up", data);

            if (response.status === 201) {
                setLoading(false);
                console.log("redirect to sign in page");
            }
        } catch (error: unknown | AxiosError) {
            setLoading(false);
            if (error instanceof AxiosError && error?.response) {
                if (error?.response.status === 400) {
                    let { message } = error?.response.data;

                    setRegisterError(message);
                } else {
                    setRegisterError(["Registration error"]);
                }
            } else {
                setRegisterError([`${error}`]);
            }
        }
    }

    const errors = registerError.length ? (
        <Group grow>
            <Alert title="Error" color="red">
                {registerError.map((message, idx) => (
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
            <Paper p={30} mt={30} withBorder shadow="md">
                <Text size="lg" weight={500} align="center">
                    Welcome, Sign up
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
                    label="Or continue with email"
                    labelPosition="center"
                    my="lg"
                />

                <form
                    onSubmit={registrationForm.onSubmit(
                        async (values) => await onRegister(values)
                    )}
                >
                    <LoadingOverlay visible={loading} overlayBlur={1} />
                    <Stack>
                        <TextInput
                            required
                            label="Username"
                            placeholder="Your username"
                            {...registrationForm.getInputProps("username")}
                        />
                        <TextInput
                            required
                            label="Email"
                            placeholder=" Your email"
                            {...registrationForm.getInputProps("email")}
                        />
                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            {...registrationForm.getInputProps("password")}
                        />
                        <PasswordInput
                            required
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            {...registrationForm.getInputProps(
                                "confirmPassword"
                            )}
                        />
                    </Stack>
                
                    <Space h="md" />
                    {errors}

                    <Group position="apart" mt="xl">
                        <Anchor
                            component="button"
                            type="button"
                            color="dimmed"
                            size="xs"
                        >
                            Already have an account? Login
                        </Anchor>
                        <Button type="submit">Sign Up</Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}
