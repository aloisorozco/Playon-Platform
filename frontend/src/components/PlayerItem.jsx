import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

export const playerItemType = {
  undrafted: 0,
  drafted: 1,
  team: 2,
};

export default function PlayerItem({
  player,
  playerType,
  canDraft = false,
  setPlayerId = null,
}) {
  const [open, setOpen] = useState(false);
  const isTeamPlayer = playerType === playerItemType.team;
  const points = isTeamPlayer
    ? player?.pointsAccumulated
    : player?.avgFantasyPoints;
  const initials = (player.name || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleDraft = () => {
    if (setPlayerId) setPlayerId(player.id);
  };

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.25, sm: 2 },
          textAlign: "left",
          p: { xs: 1.25, sm: 1.5 },
          border: 1,
          borderColor: "divider",
          borderRadius: 2.5,
          bgcolor: "background.paper",
          color: "text.primary",
          cursor: "pointer",
          transition:
            "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 8px 22px rgba(20, 125, 120, 0.11)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 42,
            height: 42,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {player.name || "Unnamed player"}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 0.6, flexWrap: "wrap" }}
          >
            <Typography variant="body2" color="text.secondary">
              {player.team || "FA"}
            </Typography>
            <Chip
              label={player.position || "Player"}
              size="small"
              variant="outlined"
              sx={{ height: 22 }}
            />
          </Stack>
        </Box>
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
            {Number(points || 0).toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isTeamPlayer ? "POINTS" : "AVG"}
          </Typography>
        </Box>
      </Box>
      <PlayerPopup
        player={player}
        open={open}
        setOpen={setOpen}
        playerType={playerType}
        canDraft={canDraft}
        handleDraft={handleDraft}
      />
    </>
  );
}

function PlayerPopup({
  player,
  open,
  setOpen,
  playerType,
  canDraft = false,
  handleDraft = null,
}) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
        {player.name || "Player"}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Regular season averages
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1,
            minWidth: { xs: 260, sm: 420 },
          }}
        >
          {[
            ["Points", player.avg_points],
            ["Assists", player.avg_assists],
            ["Rebounds", player.avg_rebounds],
            ["Steals", player.avg_steals],
            ["Blocks", player.avg_blocks],
            ["Turnovers", player.avg_turnovers],
          ].map(([label, value]) => (
            <Box
              key={label}
              sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "action.hover" }}
            >
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography sx={{ fontWeight: 800 }}>{value ?? "-"}</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Close</Button>
        {playerType === playerItemType.undrafted && (
          <Button
            variant="contained"
            onClick={() => {
              setOpen(false);
              if (!canDraft) {
                return;
              }
              handleDraft();
            }}
            autoFocus
            disabled={!canDraft}
          >
            Draft
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
