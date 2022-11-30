import {
    Button,
    Container,
    createStyles,
    Group,
    Text,
    Title,
} from "@mantine/core";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApiClient } from "../hooks";

const useStyles = createStyles((theme) => ({
    root: {
        paddingTop: 80,
        paddingBottom: 80,
    },
    label: {
        textAlign: "center",
        fontWeight: 900,
        fontSize: 220,
        lineHeight: 1,
        marginBottom: theme.spacing.xl * 1.5,
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[4]
                : theme.colors.gray[2],
        [theme.fn.smallerThan("sm")]: {
            fontSize: 120,
        },
    },
    title: {
        textAlign: "center",
        fontWeight: 900,
        fontSize: 38,
        [theme.fn.smallerThan("sm")]: {
            fontSize: 32,
        },
    },
    description: {
        maxWidth: 500,
        margin: "auto",
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl * 1.5,
    },
}));

export function NotFound404() {
    const { classes } = useStyles();

    const navigate = useNavigate();

    const apiClient = useApiClient();

    function goToHome(event: any) {
        event.preventDefault();

        navigate("/", { replace: true });
    }

    useEffect(() => {
        apiClient
            .get("/api/auth/dummy_json")
            .then((res) => console.log("response: ", res.data))
            .catch((error) => console.log("Error: ", error));
    }, []);

    return (
        <Container className={classes.root}>
            <div className={classes.label}>404</div>
            <Title className={classes.title}>Page not found</Title>
            <Text
                color="dimmed"
                size="lg"
                align="center"
                className={classes.description}
            >
                Unfortunately, this is only a 404 page. You may have mistyped
                the address, or the page has been moved to another URL.
            </Text>
            <Group position="center">
                <Button
                    size="md"
                    variant="subtle"
                    onClick={(event: any) => goToHome(event)}
                >
                    Take me back to home page
                </Button>
            </Group>
        </Container>
    );
}
