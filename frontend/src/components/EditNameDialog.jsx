import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

export default function EditNameDialog({
  open,
  title,
  label,
  value,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(value || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(value || "");
      setError("");
    }
  }, [open, value]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextName = name.trim();

    if (!nextName) {
      setError(`${label} is required`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave(nextName);
      onClose();
    } catch {
      setError(`Unable to update ${label.toLowerCase()}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={label}
            value={name}
            onChange={(event) => setName(event.target.value)}
            margin="dense"
            disabled={saving}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
