import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Todo List</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">My Todo List</h1>
        <Authenticated>
          <p className="text-lg text-secondary">
            Welcome back, {loggedInUser?.email ?? "friend"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-secondary">Sign in to manage your todos</p>
        </Unauthenticated>
      </div>

      <Authenticated>
        <TodoApp />
      </Authenticated>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </div>
  );
}

function TodoApp() {
  const todos = useQuery(api.todos.list) || [];
  const addTodo = useMutation(api.todos.add);
  const toggleTodo = useMutation(api.todos.toggle);
  const removeTodo = useMutation(api.todos.remove);
  const [newTodo, setNewTodo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      await addTodo({ text: newTodo.trim() });
      setNewTodo("");
    }
  };

  const completedCount = todos.filter(todo => todo.isCompleted).length;
  const totalCount = todos.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newTodo.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {totalCount > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          {completedCount} of {totalCount} completed
        </div>
      )}

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No todos yet. Add one above to get started!
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo._id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() => toggleTodo({ id: todo._id })}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  todo.isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                {todo.isCompleted && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <span
                className={`flex-1 ${
                  todo.isCompleted
                    ? "text-gray-500 line-through"
                    : "text-gray-900"
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => removeTodo({ id: todo._id })}
                className="text-red-500 hover:text-red-700 p-1 transition-colors"
                title="Delete todo"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
