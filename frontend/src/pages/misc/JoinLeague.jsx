import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

import AuthContext from "../../context/AuthContext";

function JoinLeague({ open, onClose }) {
  const { auth, firestore } = useContext(AuthContext);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setCode("");
      setError("");
    }
  }, [open]);

  const addTeam = async (leagueId) => {
    if (!user) return;

    firestore
      .collection(`leagues/${leagueId}/teams`)
      .doc(user.uid)
      .set({
        managerId: user.uid,
        name: `${user.displayName || "My"}'s Team`,
      })
      .then(() => {
        navigate(`/league/${leagueId}`);
      })
      .catch(() => {
        setError("Unable to add team");
      });
  };

  const isInLeague = async (leagueId) => {
    try {
      const querySnapshot = await firestore
        .collection(`leagues/${leagueId}/teams`)
        .get();
      const inLeague = querySnapshot.docs.some(
        (doc) => user?.uid === doc.data().managerId,
      );

      if (!inLeague) {
        addTeam(leagueId);
      } else {
        setError("Team already exists");
      }
    } catch {
      setError("Unable to check league membership");
    }
  };

  const leagueExists = async (leagueId) => {
    try {
      const snapshot = await firestore
        .collection("leagues")
        .doc(leagueId)
        .get();
      if (snapshot.data()) {
        isInLeague(leagueId);
      } else {
        setError("League not found");
      }
    } catch {
      setError("Unable to find league");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!code.trim()) {
      setError("Enter a league code");
      return;
    }

    leagueExists(code.trim());
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Join a league</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="League code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. ABC123"
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !user}
          >
            Join league
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default JoinLeague;
