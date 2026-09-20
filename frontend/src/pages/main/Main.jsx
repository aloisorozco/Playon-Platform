import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import "firebase/compat/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import AuthContext from "../../context/AuthContext";
import JoinLeague from "../misc/JoinLeague";

function Main() {
  const { auth, firestore } = useContext(AuthContext);
  const [user, loading] = useAuthState(auth);
  const [leagues, setLeagues] = useState([]);
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    if (!user || !firestore) {
      setLeagues([]);
      return undefined;
    }

    const unsubscribe = firestore
      .collection("leagues")
      .onSnapshot(async (snapshot) => {
        const leagueData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const teamSnapshot = await firestore
              .collection(`leagues/${doc.id}/teams`)
              .get();
            const isManager = teamSnapshot.docs.some(
              (teamDoc) => teamDoc.data().managerId === user.uid,
            );
            return isManager ? { id: doc.id, ...doc.data() } : null;
          }),
        );

        setLeagues(leagueData.filter(Boolean));
      });

    return () => unsubscribe();
  }, [firestore, user]);

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 4, md: 6 } }}
      className="page-enter"
    >
      <Stack spacing={3} alignItems="center">
        <Box textAlign="center">
          <Typography
            variant="overline"
            color="primary"
            sx={{ letterSpacing: 2 }}
          >
            HOME
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, letterSpacing: -0.7 }}
          >
            Your leagues
          </Typography>
        </Box>

        <Card
          sx={{
            width: "100%",
            maxWidth: 640,
            borderRadius: 4,
            border: 1,
            borderColor: "divider",
            boxShadow: "0 18px 44px rgba(20, 125, 120, 0.08)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress />
              </Box>
            ) : leagues.length === 0 ? (
              <Stack spacing={2} alignItems="center" py={2}>
                <Typography variant="h6">No leagues yet</Typography>
                <Typography variant="body2" color="text.secondary">
                  Join a league code to get started.
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                {leagues.map((league) => (
                  <Button
                    key={league.id}
                    component={RouterLink}
                    to={`/league/${league.id}`}
                    variant="outlined"
                    sx={{
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    <span>{league.name}</span>
                  </Button>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={() => setJoinOpen(true)}
          variant="contained"
          color="secondary"
          sx={{ borderRadius: 999, px: 3 }}
        >
          Join league
        </Button>
      </Stack>
      <JoinLeague open={joinOpen} onClose={() => setJoinOpen(false)} />
    </Container>
  );
}

export default Main;
