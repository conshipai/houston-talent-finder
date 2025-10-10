import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Please log in to view your profile</div>;
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      photos: {
        where: { approved: true }
      }
    }
  });

  if (!profile) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">No Profile Yet</h1>
        <Link href="/profile/edit" className="btn btn-primary">
          Create Your Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          {profile.profilePhoto && (
            <Image
              src={`/api/images/${profile.profilePhoto}`}
              alt={profile.displayName || 'Profile'}
              width={200}
              height={200}
              className="rounded-lg"
            />
          )}
          
          <div>
            <h2 className="text-2xl font-bold">{profile.displayName}</h2>
            <p className="text-gray-600">@{profile.user.username}</p>
            <p className="mt-4">{profile.bio}</p>
            
            <div className="mt-6 space-x-4">
              <Link href="/profile/edit" className="btn btn-primary">
                Edit Profile
              </Link>
              <Link href={`/talent/${profile.user.username}`} className="btn btn-secondary">
                View Public Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
