import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type Poetry = {
    id : Text;
    title : Text;
    content : Text;
    category : Text;
    image : ?Storage.ExternalBlob;
    likeCount : Nat;
    createdAt : Int;
  };

  public type Dua = {
    id : Text;
    title : Text;
    content : Text;
    category : Text;
    audio : ?Storage.ExternalBlob;
    likeCount : Nat;
    createdAt : Int;
  };

  public type Song = {
    id : Text;
    title : Text;
    artist : Text;
    category : Text;
    audio : ?Storage.ExternalBlob;
    likeCount : Nat;
    createdAt : Int;
  };

  public type CreatePoetryInput = {
    title : Text;
    content : Text;
    image : ?Storage.ExternalBlob;
  };

  public type CreateDuaInput = {
    title : Text;
    content : Text;
    audio : ?Storage.ExternalBlob;
  };

  public type CreateSongInput = {
    title : Text;
    artist : Text;
    audio : Storage.ExternalBlob;
  };

  let poetryMap = Map.empty<Text, Poetry>();
  let duaMap = Map.empty<Text, Dua>();
  let songMap = Map.empty<Text, Song>();

  var poetryCounter : Nat = 0;
  var duaCounter : Nat = 0;
  var songCounter : Nat = 0;

  public type UserRecord = {
    uniqueCode : Text;
    deviceId : Text;
    name : Text;
    server : Text;
    isBlocked : Bool;
  };

  var userCounter : Nat = 0;
  let usersMap = Map.empty<Text, UserRecord>();

  var maintenanceMode : Bool = false;
  var isInitialized = false;

  func isEmpty(val : Text) : Bool {
    val.trim(#char ' ').size() == 0;
  };
  func isValidAudio(_ : Storage.ExternalBlob) : Bool { true };
  func isValidImage(_ : Storage.ExternalBlob) : Bool { true };
  func generateRandomLikes() : Int { 1000 + (Time.now() % 1001) };

  public shared ({ caller }) func initialize(adminToken : Text, userProvidedToken : Text) : async () {
    if (isInitialized) {
      Runtime.trap("Initialization already done. Only once allowed.");
    };
    ignore AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
    isInitialized := true;
  };

  public shared ({ caller }) func createPoetry(input : CreatePoetryInput) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create poetry");
    };

    if (isEmpty(input.title) or isEmpty(input.content)) {
      Runtime.trap("Title and content must not be empty");
    };

    switch (input.image) {
      case (?img) {
        if (not isValidImage(img)) {
          Runtime.trap("Invalid image file type");
        };
      };
      case (null) {};
    };

    poetryCounter += 1;
    let id = "poetry_" # poetryCounter.toText();
    let newPoetry : Poetry = {
      id;
      title = input.title;
      content = input.content;
      image = input.image;
      category = "poetry";
      likeCount = Int.abs(generateRandomLikes());
      createdAt = Time.now();
    };

    poetryMap.add(id, newPoetry);
    id;
  };

  public shared ({ caller }) func createDua(input : CreateDuaInput) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create dua");
    };

    if (isEmpty(input.title) or isEmpty(input.content)) {
      Runtime.trap("Title and content must not be empty");
    };

    switch (input.audio) {
      case (?aud) {
        if (not isValidAudio(aud)) {
          Runtime.trap("Invalid audio file type");
        };
      };
      case (null) {};
    };

    duaCounter += 1;
    let id = "dua_" # duaCounter.toText();
    let newDua : Dua = {
      id;
      title = input.title;
      content = input.content;
      audio = input.audio;
      category = "dua";
      likeCount = Int.abs(generateRandomLikes());
      createdAt = Time.now();
    };

    duaMap.add(id, newDua);
    id;
  };

  public shared ({ caller }) func createSong(input : CreateSongInput) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create songs");
    };

    if (isEmpty(input.title) or isEmpty(input.artist)) {
      Runtime.trap("Title and artist must not be empty");
    };

    if (not isValidAudio(input.audio)) {
      Runtime.trap("Invalid audio file type");
    };

    songCounter += 1;
    let id = "song_" # songCounter.toText();
    let newSong : Song = {
      id;
      title = input.title;
      artist = input.artist;
      audio = ?input.audio;
      category = "song";
      likeCount = Int.abs(generateRandomLikes());
      createdAt = Time.now();
    };

    songMap.add(id, newSong);
    id;
  };

  public shared ({ caller }) func deletePoetry(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete poetry");
    };

    switch (poetryMap.get(id)) {
      case (?_) {
        poetryMap.remove(id);
        not (poetryMap.containsKey(id));
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func deleteDua(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete dua");
    };

    switch (duaMap.get(id)) {
      case (?_) {
        duaMap.remove(id);
        not (duaMap.containsKey(id));
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func deleteSong(id : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete songs");
    };

    switch (songMap.get(id)) {
      case (?_) {
        songMap.remove(id);
        not (songMap.containsKey(id));
      };
      case (null) { false };
    };
  };

  public query func getPoetryById(id : Text) : async ?Poetry {
    poetryMap.get(id);
  };

  public query func getDuaById(id : Text) : async ?Dua {
    duaMap.get(id);
  };

  public query func getSongById(id : Text) : async ?Song {
    songMap.get(id);
  };

  public query func getAllPoetry() : async [Poetry] {
    poetryMap.values().toArray();
  };

  public query func getAllDua() : async [Dua] {
    duaMap.values().toArray();
  };

  public query func getAllSongs() : async [Song] {
    songMap.values().toArray();
  };

  public shared func incrementPoetryLike(id : Text) : async Nat {
    switch (poetryMap.get(id)) {
      case (?poetry) {
        let newLikeCount = poetry.likeCount + 1;
        let updatedPoetry = { poetry with likeCount = newLikeCount };
        poetryMap.add(id, updatedPoetry);
        newLikeCount;
      };
      case (null) { Runtime.trap("Poetry not found") };
    };
  };

  public shared func incrementDuaLike(id : Text) : async Nat {
    switch (duaMap.get(id)) {
      case (?dua) {
        let newLikeCount = dua.likeCount + 1;
        let updatedDua = { dua with likeCount = newLikeCount };
        duaMap.add(id, updatedDua);
        newLikeCount;
      };
      case (null) { Runtime.trap("Dua not found") };
    };
  };

  public shared func incrementSongLike(id : Text) : async Nat {
    switch (songMap.get(id)) {
      case (?song) {
        let newLikeCount = song.likeCount + 1;
        let updatedSong = { song with likeCount = newLikeCount };
        songMap.add(id, updatedSong);
        newLikeCount;
      };
      case (null) { Runtime.trap("Song not found") };
    };
  };

  public shared ({ caller }) func registerUser(name : Text, server : Text, deviceId : Text) : async Text {
    userCounter += 1;
    let uniqueCode = "DM-" # userCounter.toText();
    let newUser : UserRecord = {
      uniqueCode;
      deviceId;
      name;
      server;
      isBlocked = false;
    };
    usersMap.add(deviceId, newUser);
    uniqueCode;
  };

  public query func getUserByDeviceId(deviceId : Text) : async ?UserRecord {
    usersMap.get(deviceId);
  };

  public query func getMaintenanceMode() : async Bool {
    maintenanceMode;
  };

  public shared ({ caller }) func setMaintenanceMode(enabled : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set maintenance mode");
    };
    maintenanceMode := enabled;
  };

  public shared ({ caller }) func toggleMaintenanceMode() : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can toggle maintenance mode");
    };
    maintenanceMode := not maintenanceMode;
    maintenanceMode;
  };

  public shared ({ caller }) func blockUser(uniqueCode : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can block users");
    };
    for ((deviceId, user) in usersMap.entries()) {
      if (user.uniqueCode == uniqueCode) {
        let updatedUser = { user with isBlocked = true };
        usersMap.add(deviceId, updatedUser);
        return ();
      };
    };
    Runtime.trap("User not found");
  };

  public shared ({ caller }) func unblockUser(uniqueCode : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can unblock users");
    };
    for ((deviceId, user) in usersMap.entries()) {
      if (user.uniqueCode == uniqueCode) {
        let updatedUser = { user with isBlocked = false };
        usersMap.add(deviceId, updatedUser);
        return ();
      };
    };
    Runtime.trap("User not found");
  };

  public query ({ caller }) func getAllUsers() : async [UserRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };
    usersMap.values().toArray();
  };
};
