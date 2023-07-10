const fetchOptions = {
  credentials: "include",
  headers: {
    "X-IG-App-ID": "936619743392459",
  },
  method: "GET",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const random = (min, max) => Math.ceil(Math.random() * (max - min)) + min;
const concatFriendshipsApiResponse = async (
  list,
  user_id,
  count,
  next_max_id = ""
) => {
  let url = `https://www.instagram.com/api/v1/friendships/${user_id}/${list}/?count=${count}`;
  if (next_max_id) {
    url += `&max_id=${next_max_id}`;
  }

  const data = await fetch(url, fetchOptions).then((r) => r.json());

  if (data.next_max_id) {
    const timeToSleep = random(100, 500);
    console.log(
      `Read ${data.users.length} ${list}. Sleeping ${timeToSleep}ms`
    );

    await sleep(timeToSleep);

    return data.users.concat(
      await concatFriendshipsApiResponse(list, user_id, count, data.next_max_id)
    );
  }

  return data.users;
};

const getFollowers = (user_id, count = 50, next_max_id = "") => {
  return concatFriendshipsApiResponse("followers", user_id, count, next_max_id);
};

const getFollowing = (user_id, count = 50, next_max_id = "") => {
  return concatFriendshipsApiResponse("following", user_id, count, next_max_id);
};

const getUserId = async (username) => {
  let user = username;

  const lower = user.toLowerCase();
  const url = `https://www.instagram.com/api/v1/web/search/topsearch/?context=blended&query=${lower}&include_reel=false`;
  const data = await fetch(url, fetchOptions).then((r) => r.json());

  const result = data.users?.find(
    (result) => result.user.username.toLowerCase() === lower
  );

  return result?.user?.pk || null;
};

const getUserFriendshipStats = async (username) => {
  const user_id = await getUserId(username);

  const followers = await getFollowers(user_id);
  const following = await getFollowing(user_id);

  const followersUsernames = followers.map((follower) =>
    follower.username.toLowerCase()
  );
  const followingUsernames = following.map((followed) =>
    followed.username.toLowerCase()
  );

  console.log(Array(28).fill("-").join(""));
  console.log(
    `Fetched`,
    followersUsernames.length,
    "followers and ",
    followingUsernames.length,
    " following."
  );

  // const PeopleIDontFollowBack = followersUsernames.filter(
  //   (follower) => !followingUsernames.includes(follower)
  // );

  const PeopleNotFollowingMeBack = followingUsernames.filter(
    (following) => !followersUsernames.includes(following)
  );

  return {
    PeopleNotFollowingMeBack,
  };
};

username = "thusalapi";
getUserFriendshipStats(username).then(console.log);
