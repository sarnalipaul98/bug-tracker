
import { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [memberEmails, setMemberEmails] = useState({});

  // TICKET MANAGEMENT
const [tickets, setTickets] = useState({});
const [ticketForms, setTicketForms] = useState({});
const [ticketLoading, setTicketLoading] = useState({});
const [ticketMessages, setTicketMessages] = useState({});

  // PROFILE
  const [showProfile, setShowProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const token = localStorage.getItem('token');

  // FETCH PROJECTS
  const fetchProjects = async () => {
    const savedToken = localStorage.getItem('token');

    if (!savedToken) return;

    setLoading(true);

    try {
      const response = await fetch(`${API}/projects`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        setMessage(data.message || 'Could not load projects');
        return;
      }

      setProjects(data.projects || []);
    } catch (error) {
      setMessage('Cannot connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // FETCH TICKETS FOR A PROJECT
const fetchTickets = async (projectId) => {
  try {
    const savedToken = localStorage.getItem('token');

    const response = await fetch(
      `${API}/tickets/project/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setTicketMessages((prev) => ({
        ...prev,
        [projectId]: data.message || 'Could not load tickets.',
      }));
      return;
    }

    setTickets((prev) => ({
      ...prev,
      [projectId]: data.tickets || [],
    }));
  } catch (error) {
    setTicketMessages((prev) => ({
      ...prev,
      [projectId]: 'Unable to connect to backend.',
    }));
  }
};

// CREATE TICKET
const handleCreateTicket = async (e, projectId) => {
  e.preventDefault();

  const form = ticketForms[projectId] || {};

  try {
    const response = await fetch(`${API}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        title: form.title || '',
        description: form.description || '',
        priority: form.priority || 'Medium',
        status: form.status || 'Open',
        assignee: form.assignee || null,
        projectId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setTicketMessages((prev) => ({
        ...prev,
        [projectId]: data.message || 'Could not create ticket.',
      }));
      return;
    }

    setTicketForms((prev) => ({
      ...prev,
      [projectId]: {
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        assignee: '',
      },
    }));

    setTicketMessages((prev) => ({
      ...prev,
      [projectId]: 'Ticket created successfully!',
    }));

    await fetchTickets(projectId);
  } catch (error) {
    setTicketMessages((prev) => ({
      ...prev,
      [projectId]: 'Unable to create ticket.',
    }));
  }
};

  // UPDATE PROFILE
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');

    if (!/^[a-zA-Z ]+$/.test(profileName.trim())) {
      setProfileMessage('Only letters and spaces are allowed in the name.');
      return;
    }

    try {
      const response = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(data.message || 'Could not update profile');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setProfileName(data.user.name);
      setProfileEmail(data.user.email);
      setProfileMessage('Profile updated successfully!');
    } catch (error) {
      setProfileMessage('Unable to update profile.');
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setProfileMessage('');

    try {
      const response = await fetch(`${API}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setProfileMessage(data.message || 'Could not change password');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setProfileMessage('Password changed successfully!');
    } catch (error) {
      setProfileMessage('Unable to change password.');
    }
  };

  // LOGIN AND REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // NAME VALIDATION FOR REGISTRATION
    if (!isLogin && !/^[a-zA-Z ]+$/.test(name.trim())) {
      setMessage('Only letters and spaces are allowed in the name.');
      return;
    }

    const endpoint = isLogin ? 'login' : 'register';

    const body = isLogin
      ? { email, password }
      : { name: name.trim(), email, password };

    try {
      const response = await fetch(
        `${API}/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Something went wrong');
        return;
      }

      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setMessage('');
      } else {
        setMessage('Registration successful! Please login.');
        setIsLogin(true);
        setName('');
        setPassword('');
      }
    } catch (error) {
      setMessage('Cannot connect to backend. Please try again.');
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    setProjects([]);
    setMessage('Logged out successfully.');
  };

  // CREATE PROJECT
  const handleCreateProject = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not create project');
        return;
      }

      setTitle('');
      setDescription('');
      setMessage('Project created successfully!');
      await fetchProjects();
    } catch (error) {
      setMessage('Unable to create project.');
    }
  };

  // START EDITING
  const startEditing = (project) => {
    setEditingId(project._id);
    setEditTitle(project.title);
    setEditDescription(project.description);
    setMessage('');
  };

  // UPDATE PROJECT
  const handleUpdateProject = async (e, projectId) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not update project');
        return;
      }

      setEditingId(null);
      setMessage('Project updated successfully!');
      await fetchProjects();
    } catch (error) {
      setMessage('Unable to update project.');
    }
  };

  // DELETE PROJECT
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not delete project');
        return;
      }

      setMessage('Project deleted successfully!');
      await fetchProjects();
    } catch (error) {
      setMessage('Unable to delete project.');
    }
  };

  // ADD TEAM MEMBER
  const handleAddMember = async (projectId) => {
    const memberEmail = memberEmails[projectId]?.trim();

    if (!memberEmail) {
      setMessage('Please enter a team member email.');
      return;
    }

    try {
      const response = await fetch(
        `${API}/projects/${projectId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: memberEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not add team member');
        return;
      }

      setMemberEmails((prev) => ({
        ...prev,
        [projectId]: '',
      }));

      setMessage('Team member added successfully!');
      await fetchProjects();
    } catch (error) {
      setMessage('Unable to add team member.');
    }
  };

  // REMOVE TEAM MEMBER
  const handleRemoveMember = async (projectId, userId) => {
    if (!window.confirm('Remove this team member?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/projects/${projectId}/members/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Could not remove team member');
        return;
      }

      setMessage('Team member removed successfully!');
      await fetchProjects();
    } catch (error) {
      setMessage('Unable to remove team member.');
    }
  };

  // LOGIN / REGISTER SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
            Bug Tracker
          </h1>

          <p className="text-center text-gray-500 mb-6">
            {isLogin ? 'Login to your account' : 'Create a new account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  const value = e.target.value;

                  if (/^[a-zA-Z ]*$/.test(value)) {
                    setName(value);
                    setMessage('');
                  } else {
                    setMessage('Only letters and spaces are allowed in the name.');
                  }
                }}
                required
                className="w-full border p-3 rounded-lg"
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border p-3 rounded-lg"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border p-3 rounded-lg"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          {message && (
            <p className="text-center mt-4 text-sm text-blue-600">
              {message}
            </p>
          )}

          <p className="text-center mt-6 text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
              }}
              className="text-blue-600 font-semibold ml-2"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // PROJECT DASHBOARD
  // PROJECT DASHBOARD
return (
  <div className="min-h-screen bg-gray-100 md:pl-64">

    {/* SIDEBAR */}
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex-col p-6">
      <h2 className="text-2xl font-bold text-blue-400 mb-10">
        Bug Tracker
      </h2>

      <nav className="space-y-3">
        <a href="#dashboard" className="block px-4 py-3 rounded-lg bg-blue-600">
          🏠 Dashboard
        </a>

        <a href="#projects" className="block px-4 py-3 rounded-lg hover:bg-gray-700">
          📁 Projects
        </a>

        <a href="#tickets" className="block px-4 py-3 rounded-lg hover:bg-gray-700">
          🎫 Tickets
        </a>
      </nav>
    </aside>

    <header className="bg-blue-700 text-white p-5 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Bug Tracker</h1>
            <p className="text-blue-100 text-sm">
              Project Management Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, {user.name}
            </span>

            <button
              onClick={() => {
  setProfileName((user.name || '').replace(/[^a-zA-Z ]/g, ''));
  setProfileEmail(user.email || '');
  setProfileMessage('');
  setShowProfile(true);
}}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100"
            >
              👤 Profile
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION */}
<nav className="md:hidden flex justify-around bg-gray-900 text-white p-3">
  <a href="#dashboard" className="text-sm">🏠 Dashboard</a>
  <a href="#projects" className="text-sm">📁 Projects</a>
  <a href="#tickets" className="text-sm">🎫 Tickets</a>
</nav>

      {/* PROFILE WINDOW */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-blue-700">
                My Profile
              </h2>

              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-500 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Edit Personal Details
              </h3>

             <input
  type="text"
  placeholder="Your Name"
  value={profileName}
  onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z ]/g, '');
    setProfileName(value);
    setProfileMessage('');
  }}
  required
  className="w-full border p-3 rounded-lg"
/>

              <input
                type="email"
                placeholder="Your Email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
                className="w-full border p-3 rounded-lg"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
              >
                Save Profile
              </button>
            </form>

            <hr className="my-5" />

            <form onSubmit={handleChangePassword} className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                Change Password
              </h3>

              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border p-3 rounded-lg"
              />

              <input
                type="password"
                placeholder="New Password (minimum 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border p-3 rounded-lg"
              />

              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
              >
                Change Password
              </button>
            </form>

            {profileMessage && (
              <p className="mt-4 text-center text-sm text-blue-700">
                {profileMessage}
              </p>
            )}
          </div>
        </div>
      )}

      <main id="dashboard" className="max-w-6xl mx-auto p-4 md:p-6">
        {/* BREADCRUMBS */}
<div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
  <span className="text-blue-600 font-semibold">Dashboard</span>
  <span>›</span>
  <span>Projects</span>
</div>
        {/* CREATE PROJECT */}
        <section className="bg-white p-5 md:p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Create New Project
          </h2>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border p-3 rounded-lg"
            />

            <textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="3"
              className="w-full border p-3 rounded-lg"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create Project
            </button>
          </form>
        </section>

        {/* MESSAGE */}
        {message && (
          <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-5">
            {message}
          </div>
        )}

        {/* PROJECT LIST */}
        <section id="projects">
          <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
            <h2 className="text-2xl font-bold text-gray-800">
              My Projects ({projects.length})
            </h2>

            <button
              onClick={fetchProjects}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <p className="text-center text-gray-500 py-5">
              Loading projects...
            </p>
          )}

          {!loading && projects.length === 0 && (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <h3 className="text-lg font-semibold text-gray-700">
                No projects found
              </h3>
              <p className="text-gray-500 mt-2">
                Create your first project using the form above.
              </p>
            </div>
          )}

          <div className="mb-5">
  <label className="block font-semibold mb-2">Select Project</label>
  <select
    className="w-full md:w-80 border rounded-lg p-3 bg-white"
    onChange={(e) => {
      document.getElementById(e.target.value)?.scrollIntoView({
        behavior: "smooth",
      });
    }}
    defaultValue=""
  >
    <option value="" disabled>Choose a project</option>
    {projects.map((project) => (
      <option key={project._id} value={`project-${project._id}`}>
        {project.title}
      </option>
    ))}
  </select>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => {
              const isOwner =
                String(project.createdBy?._id || project.createdBy) ===
                String(user.id);

              return (
                <div
                id={`project-${project._id}`}
                  key={project._id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
                >
                  {editingId === project._id ? (
                    <form
                      onSubmit={(e) =>
                        handleUpdateProject(e, project._id)
                      }
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-bold">
                        Edit Project
                      </h3>

                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                        className="w-full border p-3 rounded-lg"
                      />

                      <textarea
                        value={editDescription}
                        onChange={(e) =>
                          setEditDescription(e.target.value)
                        }
                        required
                        rows="3"
                        className="w-full border p-3 rounded-lg"
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-green-600 text-white px-4 py-2 rounded-lg"
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-blue-700 mb-2">
                        {project.title}
                      </h3>

                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                        {project.description}
                      </p>

                      <p className="text-xs text-gray-400 mb-4">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>

                      <div className="border-t pt-4 mt-3">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Team Members ({project.teamMembers?.length || 0})
                        </h4>

                        {project.teamMembers?.length > 0 ? (
                          <div className="space-y-2">
                            {project.teamMembers.map((member) => (
                              <div
                                key={member._id}
                                className="flex flex-wrap justify-between items-center bg-gray-50 p-3 rounded-lg gap-2"
                              >
                                <div>
                                  <p className="font-medium text-sm">
                                    {member.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {member.email}
                                  </p>
                                </div>

                                {isOwner && (
                                  <button
                                    onClick={() =>
                                      handleRemoveMember(
                                        project._id,
                                        member._id
                                      )
                                    }
                                    className="text-red-600 text-sm font-semibold"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            No team members added yet.
                          </p>
                        )}
                      </div>

                      {isOwner && (
                        <>
                          <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <input
                              type="email"
                              placeholder="Team member email"
                              value={memberEmails[project._id] || ''}
                              onChange={(e) =>
                                setMemberEmails((prev) => ({
                                  ...prev,
                                  [project._id]: e.target.value,
                                }))
                              }
                              className="flex-1 min-w-0 border p-2 rounded-lg"
                            />

                            <button
                              onClick={() => handleAddMember(project._id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              Add Member
                            </button>
                          </div>

                          <div className="flex gap-3 mt-5 pt-4 border-t">
                            <button
                              onClick={() => startEditing(project)}
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteProject(project._id)
                              }
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                        
                      )}
                      {/* TICKET MANAGEMENT */}
<div
  id={project._id === projects[0]?._id ? "tickets" : undefined}
  className="mt-6 pt-5 border-t"
>
  <h3 className="text-xl font-bold text-gray-800 mb-4">
    Ticket Management
  </h3>

  <form
    onSubmit={(e) => handleCreateTicket(e, project._id)}
    className="space-y-3 bg-gray-50 p-4 rounded-lg"
  >
    <h4 className="font-semibold">Create New Ticket</h4>

    <input
      type="text"
      placeholder="Ticket Title"
      value={ticketForms[project._id]?.title || ''}
      onChange={(e) =>
        setTicketForms((prev) => ({
          ...prev,
          [project._id]: {
            ...prev[project._id],
            title: e.target.value,
          },
        }))
      }
      required
      className="w-full border p-3 rounded-lg"
    />

    <textarea
      placeholder="Ticket Description"
      value={ticketForms[project._id]?.description || ''}
      onChange={(e) =>
        setTicketForms((prev) => ({
          ...prev,
          [project._id]: {
            ...prev[project._id],
            description: e.target.value,
          },
        }))
      }
      required
      rows="3"
      className="w-full border p-3 rounded-lg"
    />

    <select
      value={ticketForms[project._id]?.priority || 'Medium'}
      onChange={(e) =>
        setTicketForms((prev) => ({
          ...prev,
          [project._id]: {
            ...prev[project._id],
            priority: e.target.value,
          },
        }))
      }
      className="w-full border p-3 rounded-lg"
    >
      <option value="Low">Low Priority</option>
      <option value="Medium">Medium Priority</option>
      <option value="High">High Priority</option>
    </select>

    <select
      value={ticketForms[project._id]?.assignee || ''}
      onChange={(e) =>
        setTicketForms((prev) => ({
          ...prev,
          [project._id]: {
            ...prev[project._id],
            assignee: e.target.value,
          },
        }))
      }
      className="w-full border p-3 rounded-lg"
    >
      <option value="">Unassigned</option>
      {project.teamMembers?.map((member) => (
        <option key={member._id} value={member._id}>
          {member.name}
        </option>
      ))}
    </select>

    <button
      type="submit"
      className="bg-blue-600 text-white px-5 py-2 rounded-lg"
    >
      Create Ticket
    </button>
  </form>

  {ticketMessages[project._id] && (
    <p className="mt-3 text-sm text-blue-700">
      {ticketMessages[project._id]}
    </p>
  )}

  <button
    onClick={() => fetchTickets(project._id)}
    className="mt-4 bg-gray-700 text-white px-5 py-2 rounded-lg"
  >
    View / Refresh Tickets
  </button>

  <div className="mt-4 space-y-3">
    {(tickets[project._id] || []).map((ticket) => (
      <div key={ticket._id} className="border rounded-lg p-4 bg-white">
        <h4 className="font-bold text-blue-700">{ticket.title}</h4>

        <p className="text-sm text-gray-600 mt-1">
          {ticket.description}
        </p>

        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Status: {ticket.status}
          </span>

          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
            Priority: {ticket.priority}
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Assignee: {ticket.assignee?.name || 'Unassigned'}
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Created: {ticket.createdAt
            ? new Date(ticket.createdAt).toLocaleString()
            : 'Not available'}
        </p>
      </div>
    ))}

    {tickets[project._id]?.length === 0 && (
      <p className="text-sm text-gray-500">
        No tickets found for this project.
      </p>
    )}
  </div>
</div>
                    </>
                    
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
