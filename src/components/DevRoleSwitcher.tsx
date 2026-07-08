import { useEffect, useState } from "react";
import { getRole, setRole, type AppRole } from "../services/role";

/**
 * Development-only floating widget for switching between learner/admin
 * roles until the backend returns a real role. Hidden in production.
 */
export function DevRoleSwitcher() {
  const [role, setLocal] = useState<AppRole>("learner");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocal(getRole());
  }, []);

  if (!import.meta.env.DEV) return null;

  const change = (r: AppRole) => {
    setRole(r);
    setLocal(r);
    window.location.href = r === "admin" ? "/admin" : "/dashboard";
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {open ? (
        <div
          style={{
            background: "#0f172a",
            color: "white",
            padding: "12px 14px",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            minWidth: 200,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
            Dev-only role switcher
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button
              onClick={() => change("learner")}
              style={btnStyle(role === "learner")}
            >
              Learner
            </button>
            <button
              onClick={() => change("admin")}
              style={btnStyle(role === "admin")}
            >
              Admin
            </button>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Close
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "#0f172a",
            color: "white",
            border: "none",
            padding: "10px 14px",
            borderRadius: 999,
            fontSize: 12,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          }}
        >
          🛠 Role: {role}
        </button>
      )}
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    background: active ? "#3b82f6" : "rgba(255,255,255,0.1)",
    color: "white",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    fontSize: 12,
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
  };
}
