import {
    Button,
    Container,
    createStyles,
    Group,
    Text,
    Title,
} from "@mantine/core";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { useAPIClient } from "../hooks";

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

    // react router related
    const navigate = useNavigate();

    // API request related
    const apiClient = useAPIClient();

    useQuery(
        ["dummy"],
        async () => {
            return await apiClient.get("/auth/dummy_json");
        },
        {
            retry: false,
            onSuccess: (response) => {
                console.log("res: ", response);
            },
            onError: (error) => {
                console.log("error: ", error);
            },
        }
    );

    function goToHome(event: any) {
        event.preventDefault();

        navigate("/", { replace: true });
    }

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
