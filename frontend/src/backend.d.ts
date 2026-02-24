import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface CreatePoetryInput {
    title: string;
    content: string;
    image?: ExternalBlob;
}
export interface CreateDuaInput {
    title: string;
    content: string;
    audio?: ExternalBlob;
}
export interface CreateSongInput {
    title: string;
    audio: ExternalBlob;
    artist: string;
}
export interface Song {
    id: string;
    title: string;
    audio?: ExternalBlob;
    category: string;
    artist: string;
}
export interface Poetry {
    id: string;
    title: string;
    content: string;
    likes: Likes;
    category: string;
    image?: ExternalBlob;
}
export interface Likes {
    count: bigint;
    likedBy: Array<string>;
}
export interface Dua {
    id: string;
    title: string;
    content: string;
    audio?: ExternalBlob;
    likes: Likes;
    category: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDua(input: CreateDuaInput): Promise<string>;
    createPoetry(input: CreatePoetryInput): Promise<string>;
    createSong(input: CreateSongInput): Promise<string>;
    deleteDua(id: string): Promise<boolean>;
    deletePoetry(id: string): Promise<boolean>;
    deleteSong(id: string): Promise<boolean>;
    getAllDua(): Promise<Array<Dua>>;
    getAllPoetry(): Promise<Array<Poetry>>;
    getAllSongs(): Promise<Array<Song>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDuaById(id: string): Promise<Dua | null>;
    getDuaLikes(id: string): Promise<Likes | null>;
    getPoetryById(id: string): Promise<Poetry | null>;
    getPoetryLikes(id: string): Promise<Likes | null>;
    getSongById(id: string): Promise<Song | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeDua(id: string, userId: string): Promise<boolean>;
    likePoetry(id: string, userId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
