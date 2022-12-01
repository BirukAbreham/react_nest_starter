import { Button, Container, createStyles, Text, Title } from "@mantine/core";
import { useAuth } from "../hooks";
import { AuthContextType } from "../types";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { AuthClient } from "../api";
import { requestSignOut, selectUser, useAppDispatch } from "../store";
import { useSelector } from "react-redux";

const useStyles = createStyles((theme) => ({
    wrapper: {
        position: "relative",
        paddingTop: 120,
        paddingBottom: 80,

        "@media (max-width: 755px)": {
            paddingTop: 80,
            paddingBottom: 60,
        },
    },
    inner: {
        position: "relative",
        zIndex: 1,
    },
    title: {
        textAlign: "center",
        fontWeight: 800,
        fontSize: 40,
        letterSpacing: -1,
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
        marginBottom: theme.spacing.xs,

        "@media (max-width: 520px)": {
            fontSize: 28,
            textAlign: "left",
        },
    },
    highlight: {
        color: theme.colors[theme.primaryColor][
            theme.colorScheme === "dark" ? 4 : 6
        ],
    },
    description: {
        textAlign: "center",
        "@media (max-width: 520px)": {
            textAlign: "left",
            fontSize: theme.fontSizes.md,
        },
    },
    controls: {
        marginTop: theme.spacing.lg,
        display: "flex",
        justifyContent: "center",
        "@media (max-width: 520px)": {
            flexDirection: "column",
        },
    },
    control: {
        "&:not(:first-of-type)": {
            marginLeft: theme.spacing.md,
        },
        "@media (max-width: 520px)": {
            height: 42,
            fontSize: theme.fontSizes.md,
            "&:not(:first-of-type)": {
                marginTop: theme.spacing.md,
                marginLeft: 0,
            },
        },
    },
}));

export function Home() {
    const { classes } = useStyles();

    // react router related
    const navigate = useNavigate();

    // react redux store related
    const dispatch = useAppDispatch();
    const user = useSelector(selectUser);

    async function userSignOut(event: any) {
        event.preventDefault();

        try {
            const response: any = await dispatch(requestSignOut(user.username)).unwrap();

            if (response.status === 200) {
                // redirect user to sign in page
                navigate("/sign_in", { replace: true });
            }
        } catch (error: unknown | AxiosError) {
            if (
                error instanceof AxiosError &&
                error?.response &&
                error?.response.status === 400
            ) {
                console.log("error: ", error.response.data);
            } else {
                console.error("error: ", error);
            }
        }
    }

    return (
        <Container className={classes.wrapper} size={1400}>
            <div className={classes.inner}>
                <Title className={classes.title}>
                    Nest JS{" "}
                    <Text
                        component="span"
                        className={classes.highlight}
                        inherit
                    >
                        React
                    </Text>{" "}
                    Authentication Starter
                </Title>

                <Container p={0} size={600}>
                    <Text
                        size="lg"
                        color="dimmed"
                        className={classes.description}
                    >
                        The React features are implemented with Mantin framework
                        and React Router for navigation
                    </Text>
                </Container>

                <div className={classes.controls}>
                    <Button
                        className={classes.control}
                        size="lg"
                        variant="default"
                        color="gray"
                    >
                        Check Code on GitHub
                    </Button>
                    <Button
                        className={classes.control}
                        size="lg"
                        onClick={async (event: any) => await userSignOut(event)}
                    >
                        Log out
                    </Button>
                </div>
            </div>
        </Container>
    );
}
