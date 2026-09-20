import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import {
  Box,
  IconButton,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import AuthContext from "../../context/AuthContext";
import EditNameDialog from "../../components/EditNameDialog";
import PlayerItem, { playerItemType } from "../../components/PlayerItem";
import { FirestoreProvider } from "../../context/FirestoreContext";

function TeamOuter() {
  return (
    <FirestoreProvider>
      <Team />
    </FirestoreProvider>
  );
}

function Team() {
  const { auth, firestore } = useContext(AuthContext);
  const [user] = useAuthState(auth);
  const [players, setPlayers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [team, setTeam] = useState({});
  const [editOpen, setEditOpen] = useState(false);
  const { id, teamId } = useParams();
  const totalPoints = players.reduce(
    (total, player) => total + (Number(player?.pointsAccumulated) || 0),
    0,
  );

  useEffect(() => {
    if (!id || !teamId || !firestore) return undefined;

    const teamRef = firestore
      .collection("leagues")
      .doc(id)
      .collection("teams")
      .doc(teamId);
    const playersRef = firestore
      .collection(`leagues/${id}/players`)
      .where("teamId", "==", teamId);

    const unsubscribeTeam = teamRef.onSnapshot((snapshot) => {
      if (snapshot.data()) {
        setTeam(snapshot.data());
        setTeamLoading(false);
      }
    });

    const unsubscribePlayers = playersRef.onSnapshot((snapshot) => {
      const temp = [];
      snapshot.forEach((item) => temp.push({ id: item.id, ...item.data() }));
      setPlayers(temp);
    });

    return () => {
      unsubscribeTeam();
      unsubscribePlayers();
    };
  }, [firestore, id, teamId]);

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 4, md: 6 } }}
      className="page-enter"
    >
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 20px 48px rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="overline"
                color="primary"
                sx={{ letterSpacing: 2 }}
              >
                TEAM
              </Typography>
              <Stack
                direction="row"
                alignItems="baseline"
                spacing={0.5}
                sx={{ minWidth: 0 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: -0.8,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {teamLoading ? "Loading team..." : team?.name}
                  </Typography>
                </Box>
                {user?.uid === team?.managerId && (
                  <IconButton
                    onClick={() => setEditOpen(true)}
                    aria-label="Edit team"
                    color="primary"
                  >
                    <EditOutlinedIcon />
                  </IconButton>
                )}
              </Stack>
            </Box>
            <Box
              sx={{
                minWidth: 132,
                px: 2,
                py: 1.25,
                borderRadius: 2.5,
                bgcolor: "action.hover",
                textAlign: { xs: "left", sm: "right" },
              }}
            >
              <Typography variant="caption" color="text.secondary">
                OVERALL POINTS
              </Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
                {totalPoints.toFixed(1)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
          <Stack spacing={1.25}>
            {players.map((player) => (
              <PlayerItem
                player={player}
                key={player.id}
                playerType={playerItemType.team}
              />
            ))}
          </Stack>

          {!players.length && (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography color="text.secondary">
                No players have been added to this team yet.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      <EditNameDialog
        open={editOpen}
        title="Edit team name"
        label="Team name"
        value={team?.name}
        onClose={() => setEditOpen(false)}
        onSave={(name) =>
          firestore
            .collection("leagues")
            .doc(id)
            .collection("teams")
            .doc(teamId)
            .update({ name })
        }
      />
    </Container>
  );
}

export default TeamOuter;
