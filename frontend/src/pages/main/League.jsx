import React, { useContext, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import AuthContext from "../../context/AuthContext";
import EditNameDialog from "../../components/EditNameDialog";
import FirestoreContext, {
  FirestoreProvider,
} from "../../context/FirestoreContext";

function LeagueOuter() {
  return (
    <FirestoreProvider>
      <League />
    </FirestoreProvider>
  );
}

function League() {
  const { id, league, teams, players } = useContext(FirestoreContext);
  const { auth, firestore } = useContext(AuthContext);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const teamPoints = (teamId) =>
    players
      .filter((player) => player.teamId === teamId)
      .reduce(
        (total, player) => total + (Number(player?.pointsAccumulated) || 0),
        0,
      );

  return (
    <Container
      maxWidth="md"
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
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="overline"
                color="primary"
                sx={{ letterSpacing: 2 }}
              >
                LEAGUE
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, letterSpacing: -0.8 }}
              >
                {league?.name || "League"}
              </Typography>
            </Box>
            {user?.uid === league?.managerId && (
              <IconButton
                onClick={() => setEditOpen(true)}
                aria-label="Edit league"
                color="primary"
              >
                <EditOutlinedIcon />
              </IconButton>
            )}
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          {league?.draftOrder && league?.draftOrder[league?.draftPlace] && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("draft")}
              sx={{ borderRadius: 999, px: 3, mb: 3 }}
            >
              Enter draft room
            </Button>
          )}

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Teams
          </Typography>
          <List disablePadding sx={{ display: "grid", gap: 1 }}>
            {teams.map((team, index) => (
              <ListItem key={team.id} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={`team/${team.id}`}
                  sx={{
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    px: 2,
                    py: 1.25,
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Chip
                            label={index + 1}
                            size="small"
                            color={
                              index === league?.draftPlace
                                ? "secondary"
                                : "default"
                            }
                          />
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                          >
                            {team.name}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                          <Typography
                            variant="subtitle1"
                            color="primary"
                            sx={{ fontWeight: 800 }}
                          >
                            {teamPoints(team.id).toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            POINTS
                          </Typography>
                        </Box>
                      </Stack>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
      <EditNameDialog
        open={editOpen}
        title="Edit league name"
        label="League name"
        value={league?.name}
        onClose={() => setEditOpen(false)}
        onSave={(name) =>
          firestore.collection("leagues").doc(id).update({ name })
        }
      />
    </Container>
  );
}

export default LeagueOuter;
