import type { NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import React from "react";
import { inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "../server/trpc/router";
import Image from "next/future/image";

const PostCard: React.FC<{
  post: inferProcedureOutput<AppRouter["post"]["getAll"]>[number];
}> = ({ post }) => {
  return (
    <div className="shadow-xl rounded-lg p-4 w-80 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Image
          src={post.author.image ?? "https://www.w3schools.com/howto/img_avatar.png"}
          alt="Avatar"
          width={100}
          height={100}
          className="h-16 w-16 rounded-full"
        />
        <div>
          <h3 className="text-gray-900 font-medium text-lg">{post.author.name}</h3>
          <p className="text-gray-500 text-sm">
            {post.createdAt.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
        <p className="max-w-2xl text-sm text-gray-500">{post.body}</p>
      </div>
    </div>
  );
};

const CreatePostForm = () => {
  const utils = trpc.useContext();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const createPostMutation = trpc.post.create.useMutation({
    onSuccess() {
      setTitle("");
      setBody("");
      utils.post.getAll.invalidate();
    },
  });

  const { data: sesh } = trpc.auth.getSession.useQuery();
  const disabled = !sesh?.user;

  return (
    <div className="shadow-xl rounded-lg p-4 flex w-full flex-col gap-4">
      <h3 className="text-lg font-medium text-gray-900 border-b-[2px]">
        Create a new post
      </h3>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1 w-1/3">
          <label htmlFor="title">Title</label>
          <input
            className="border border-gray-300 rounded-md p-2"
            value={title}
            disabled={disabled}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="body">Body</label>
          <input
            className="border border-gray-300 rounded-md p-2"
            value={body}
            disabled={disabled}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
      <button
        className={`bg-purple-300 text-white rounded-md p-2 ${
          !sesh ? "bg-purple-100" : ""
        }`}
        disabled={disabled}
        onClick={() => {
          createPostMutation.mutate({ title, body });
        }}
      >
        {sesh?.user ? "Submit post" : "You must be signed in to post"}
      </button>
    </div>
  );
};

const Home: NextPage = () => {
  const exampleQuery = trpc.post.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container flex flex-col items-center min-h-screen p-16 mx-auto max-w-6xl">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Create <span className="text-purple-300">T3</span> App
        </h1>
        <CreatePostForm />
        <div className="flex items-center justify-center pt-6 text-2xl text-blue-500">
          {exampleQuery.data ? (
            <div className="grid grid-cols-3 gap-4 py-8">
              {exampleQuery.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
        <AuthShowcase />
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        className="px-4 py-2 border border-black text-xl rounded-md bg-violet-50 hover:bg-violet-100 shadow-lg'"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
