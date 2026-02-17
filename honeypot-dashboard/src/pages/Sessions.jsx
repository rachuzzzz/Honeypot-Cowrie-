import { useState } from 'react';
import { PageHeader } from '../components/layout';
import { useFetch } from '../hooks/useFetch';
import { getSessions } from '../services/api';
import { formatDateTime, formatDuration, formatTime } from '../utils/formatters';

/**
 * Sessions page with interactive session explorer.
 * Allows selecting a session to view its command history in chronological order.
 */
function Sessions() {
  const { data: sessions, loading, error } = useFetch(getSessions);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-soc-muted">Loading session data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-soc-danger/10 border border-soc-danger/50 rounded-lg p-4">
        <p className="text-soc-danger">Error loading sessions: {error}</p>
      </div>
    );
  }

  const selectedSession = sessions.find(
    (s) => s.session_id === selectedSessionId
  );

  // Sort sessions by start time (most recent first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.start_time) - new Date(a.start_time)
  );

  return (
    <div>
      <PageHeader
        title="Session Explorer"
        description="Analyze individual attacker sessions and their command sequences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session List */}
        <div className="lg:col-span-1">
          <div className="bg-soc-surface border border-soc-border rounded-lg">
            <div className="p-4 border-b border-soc-border">
              <h2 className="text-sm font-medium text-soc-text uppercase tracking-wide">
                Sessions ({sessions.length})
              </h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {sortedSessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => setSelectedSessionId(session.session_id)}
                  className={`w-full text-left p-4 border-b border-soc-border last:border-b-0 transition-colors ${
                    selectedSessionId === session.session_id
                      ? 'bg-soc-accent/10 border-l-2 border-l-soc-accent'
                      : 'hover:bg-soc-border/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-data text-sm text-soc-text">
                      {session.source_ip}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        session.auth_success
                          ? 'bg-soc-danger/20 text-soc-danger'
                          : 'bg-soc-muted/20 text-soc-muted'
                      }`}
                    >
                      {session.auth_success ? 'COMPROMISED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="text-xs text-soc-muted">
                    <p>User: {session.username_attempted}</p>
                    <p>{formatDateTime(session.start_time)}</p>
                    <p>
                      Duration: {formatDuration(session.duration_seconds)} •{' '}
                      {session.commands.length} commands
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="bg-soc-surface border border-soc-border rounded-lg">
              {/* Session Header */}
              <div className="p-4 border-b border-soc-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-soc-text">
                      Session: {selectedSession.session_id}
                    </h2>
                    <p className="text-sm text-soc-muted mt-1">
                      From{' '}
                      <span className="font-mono-data text-soc-text">
                        {selectedSession.source_ip}
                      </span>{' '}
                      as{' '}
                      <span className="text-soc-accent">
                        {selectedSession.username_attempted}
                      </span>
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedSession.auth_success
                        ? 'bg-soc-danger/20 text-soc-danger'
                        : 'bg-soc-muted/20 text-soc-muted'
                    }`}
                  >
                    {selectedSession.auth_success
                      ? 'Authentication Successful'
                      : 'Authentication Failed'}
                  </div>
                </div>

                {/* Session Metadata */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-soc-border">
                  <div>
                    <p className="text-xs text-soc-muted uppercase">Started</p>
                    <p className="text-sm text-soc-text">
                      {formatDateTime(selectedSession.start_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-soc-muted uppercase">Ended</p>
                    <p className="text-sm text-soc-text">
                      {formatDateTime(selectedSession.end_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-soc-muted uppercase">Duration</p>
                    <p className="text-sm text-soc-text">
                      {formatDuration(selectedSession.duration_seconds)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Command Timeline */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-soc-muted uppercase tracking-wide mb-4">
                  Command Timeline ({selectedSession.commands.length} commands)
                </h3>

                {selectedSession.commands.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSession.commands.map((cmd, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-3 bg-soc-bg rounded border border-soc-border"
                      >
                        <div className="flex-shrink-0 w-16 text-xs text-soc-muted">
                          {formatTime(cmd.timestamp)}
                        </div>
                        <div className="flex-grow">
                          <code className="font-mono-data text-sm text-soc-accent">
                            $ {cmd.command}
                          </code>
                        </div>
                        <div className="flex-shrink-0 text-xs text-soc-muted">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-soc-muted">
                    No commands executed in this session
                    <p className="text-xs mt-1">
                      (Authentication may have failed before shell access)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-soc-surface border border-soc-border rounded-lg p-8 text-center">
              <p className="text-soc-muted">
                Select a session from the list to view details
              </p>
              <p className="text-sm text-soc-muted mt-2">
                Sessions are sorted by most recent first
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sessions;
