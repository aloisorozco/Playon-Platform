import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import AuthContext from "../../context/AuthContext";
import FirestoreContext, {
  FirestoreProvider,
} from "../../context/FirestoreContext";

function DraftOuter() {
  return (
    <FirestoreProvider>
      <Draft />
    </FirestoreProvider>
  );
}

export default DraftOuter;

function Draft() {
  const {
    teams,
    draftState,
    draftOrder,
    currentTeamId,
    isMyTurn,
    error,
    setError,
  } = useContext(FirestoreContext);
  const [tab, setTab] = useState(0);
  const teamName = (id) =>
    teams.find((team) => team.id === id)?.name || "Unassigned team";
  const pickCount = draftState?.picks?.length || 0;
  const totalPicks = draftOrder.length;
  const deadline = draftState?.pickDeadline?.toMillis?.() || null;
  const [remaining, setRemaining] = useState(
    deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : 60,
  );

  useEffect(() => {
    if (!deadline) {
      setRemaining(0);
      return undefined;
    }
    const tick = () =>
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <Box
      className="page-enter"
      sx={{ maxWidth: 1440, mx: "auto", px: { xs: 2, md: 4 }, pb: 6 }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ md: "end" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="overline"
            color="primary"
            sx={{ letterSpacing: 2 }}
          >
            LIVE DRAFT ROOM
          </Typography>
          <Typography variant="h3">Make your picks count.</Typography>
          <Typography color="text.secondary">
            Snake order · {totalPicks} picks · {pickCount} completed
          </Typography>
        </Box>
        <Paper
          sx={{
            px: 2,
            py: 1.5,
            minWidth: 220,
            border: 1,
            borderColor: isMyTurn ? "secondary.main" : "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary">
              ON THE CLOCK
            </Typography>
            <TimerOutlinedIcon color={isMyTurn ? "secondary" : "disabled"} />
          </Stack>
          <Typography
            variant="h4"
            color={isMyTurn ? "secondary.main" : "text.primary"}
          >
            {remaining}s
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (remaining / 60) * 100)}
            color={isMyTurn ? "secondary" : "primary"}
          />
          <Typography variant="body2" sx={{ mt: 0.75 }}>
            {teamName(currentTeamId)} {isMyTurn && "· Your turn"}
          </Typography>
        </Paper>
      </Stack>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ overflow: "hidden" }}>
            <Tabs
              value={tab}
              onChange={(_, value) => setTab(value)}
              variant="fullWidth"
            >
              <Tab label="Player pool" />
              <Tab label="Pick history" />
            </Tabs>
            <Divider />
            {tab === 0 ? <Players /> : <History teamName={teamName} />}
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <DraftOrder teamName={teamName} />
        </Grid>
      </Grid>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={5000}
        onClose={() => setError(null)}
      >
        <Alert severity="warning" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function Players() {
  const { availablePlayers, isMyTurn, makePick } = useContext(FirestoreContext);
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      availablePlayers.filter((player) =>
        `${player.name} ${player.team} ${player.position}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [availablePlayers, query],
  );
  return (
    <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5">Available players</Typography>
          <Typography variant="body2" color="text.secondary">
            Ranked by projected fantasy points
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Search players"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1 }} />,
          }}
        />
      </Stack>
      <List disablePadding>
        {filtered.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            canDraft={isMyTurn}
            onDraft={() => makePick(player.id)}
          />
        ))}
        {!filtered.length && (
          <Typography
            color="text.secondary"
            sx={{ py: 5, textAlign: "center" }}
          >
            No available players match that search.
          </Typography>
        )}
      </List>
    </Box>
  );
}

function PlayerRow({ player, canDraft, onDraft }) {
  return (
    <ListItem
      divider
      secondaryAction={
        <Button size="small" disabled={!canDraft} onClick={onDraft}>
          Draft
        </Button>
      }
      sx={{ pr: 11, px: 1 }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {player.position?.slice(0, 2) || "?"}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={player.name}
        secondary={`${player.team || "FA"} · ${player.position || "Player"}`}
      />
      <Typography variant="body2" sx={{ mr: 2, fontWeight: 700 }}>
        {Number(player.avgFantasyPoints || 0).toFixed(1)}{" "}
        <Typography component="span" variant="caption" color="text.secondary">
          AVG
        </Typography>
      </Typography>
    </ListItem>
  );
}

function History({ teamName }) {
  const { draftState } = useContext(FirestoreContext);
  const picks = [...(draftState?.picks || [])].reverse();
  return (
    <List sx={{ p: { xs: 1.5, md: 2.5 } }}>
      {picks.map((pick) => (
        <ListItem key={`${pick.pickIndex}-${pick.playerId}`} divider>
          <ListItemAvatar>
            <Avatar>{pick.pickIndex + 1}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={pick.playerName}
            secondary={`${teamName(pick.teamId)}${pick.auto ? " · Auto-draft" : ""}`}
          />
          <Chip
            size="small"
            label={pick.auto ? "AUTO" : "PICK"}
            color={pick.auto ? "default" : "success"}
          />
        </ListItem>
      ))}
      {!picks.length && (
        <Typography color="text.secondary" sx={{ py: 5, textAlign: "center" }}>
          Picks will appear here in real time.
        </Typography>
      )}
    </List>
  );
}

function DraftOrder({ teamName }) {
  const { draftOrder, draftState } = useContext(FirestoreContext);
  const current = draftState?.currentPickIndex || 0;
  return (
    <Paper sx={{ p: { xs: 1.5, md: 2.5 }, height: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Draft order</Typography>
        <Chip
          label={`Round ${Math.floor(current / Math.max(draftOrder.length, 1)) + 1}`}
          size="small"
        />
      </Stack>
      <List disablePadding>
        {draftOrder.map((teamId, index) => (
          <ListItem
            key={`${teamId}-${index}`}
            sx={{
              borderRadius: 1,
              bgcolor: index === current ? "action.selected" : "transparent",
              mb: 0.5,
            }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: 13,
                  bgcolor:
                    index === current
                      ? "secondary.main"
                      : "action.disabledBackground",
                }}
              >
                {index + 1}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={teamName(teamId)}
              secondary={
                index === current
                  ? "On the clock"
                  : index < current
                    ? "Complete"
                    : "Waiting"
              }
            />
            <Typography
              variant="caption"
              color={index === current ? "secondary.main" : "text.secondary"}
            >
              {index < current ? "✓" : index === current ? "NOW" : "—"}
            </Typography>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1} alignItems="center">
        <AutoAwesomeIcon color="secondary" fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          Snake order reverses each round automatically.
        </Typography>
      </Stack>
    </Paper>
  );
}
