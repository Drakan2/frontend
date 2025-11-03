import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddUserDialog } from "@/components/AddUserDialog";
import { UserDetailsModal } from "@/components/UserDetailsModal";
import { ChangeCredentialsModal } from "@/components/ChangeCredentialsModal";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { User, Patient, ID } from "@/shared/types";
import { dataService } from "@/shared/config/database";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  User as UserIcon,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

const Administration: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Utilisation de useCallback pour éviter les rechargements infinis
  const loadData = useCallback(async () => {
    try {
      const [loadedUsers, loadedPatients] = await Promise.all([
        dataService.getUsers(),
        dataService.getPatients(),
      ]);
      setUsers(loadedUsers);
      setPatients(loadedPatients);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    }
  }, [toast]); // toast est maintenant une dépendance

  // Dans Administration.tsx, ajouter cette fonction
  const cleanupDeletedPatients = useCallback(async () => {
    try {
      const [allUsers, allPatients] = await Promise.all([
        dataService.getUsers(),
        dataService.getPatients(),
      ]);

      const patientIds = allPatients.map((p) => p.id);

      // Pour chaque user, filtrer les assignedPatients qui existent encore
      for (const user of allUsers) {
        const validAssignedPatients = user.assignedPatients.filter((id) =>
          patientIds.includes(id)
        );

        // Si certains patients ont été supprimés, mettre à jour le user
        if (validAssignedPatients.length !== user.assignedPatients.length) {
          console.log(
            `🔄 Nettoyage user ${user.username}: ${user.assignedPatients.length} → ${validAssignedPatients.length} patients`
          );
          await dataService.updateUser(user.id, {
            assignedPatients: validAssignedPatients,
          });
        }
      }
    } catch (error) {
      console.error("❌ Erreur nettoyage patients:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    cleanupDeletedPatients(); // ← AJOUTER CET APPEL
  }, [loadData, cleanupDeletedPatients]); // loadData est stable grâce à useCallback

  const handleViewAdmin = () => {
    if (adminUser) {
      setViewingUser(adminUser);
      setIsUserDetailsOpen(true);
    }
  };

  const handleEditAdmin = () => {
    if (adminUser) {
      setEditingUser(adminUser);
      setIsCredentialsModalOpen(true);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsAddUserOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsAddUserOpen(true);
  };

  const handleDeleteUser = (userId: ID) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Action interdite",
        description: "Vous ne pouvez pas supprimer votre propre compte.",
        variant: "destructive",
      });
      return;
    }

    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        console.log("🔄 ADMIN - Suppression user:", userToDelete.id);
        await dataService.deleteUser(userToDelete.id);

        const updatedUsers = await dataService.getUsers();
        setUsers(updatedUsers);
        toast({
          title: "Utilisateur supprimé",
          description: `L'utilisateur ${userToDelete.username} a été supprimé avec succès.`,
          variant: "destructive",
        });
        setUserToDelete(null);
      } catch (error) {
        console.error("❌ ADMIN - Erreur suppression user:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression de l'utilisateur.",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewUser = (userId: ID) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setViewingUser(user);
      setIsUserDetailsOpen(true);
    }
  };

  // Remplacer la fonction handleUserSave dans Administration.tsx
  const handleUserSave = async (userData: {
    username: string;
    password: string;
    selectedPatients?: number[];
  }) => {
    try {
      if (editingUser && isCredentialsModalOpen) {
        // Mode modification credentials uniquement
        console.log(
          "🔄 ADMIN - Modification credentials user:",
          editingUser.id
        );
        await dataService.updateUser(editingUser.id, {
          username: userData.username,
          password: userData.password,
        });
      } else if (editingUser) {
        // Mode modification complète depuis AddUserDialog
        console.log("🔄 ADMIN - Modification complète user:", editingUser.id);
        await dataService.updateUser(editingUser.id, {
          username: userData.username,
          password: userData.password,
          assignedPatients: userData.selectedPatients || [],
        });
      } else {
        // Mode ajout - CORRECTION ICI
        console.log("🔄 ADMIN - Création nouveau user");
        await dataService.createUser({
          username: userData.username,
          password: userData.password,
          role: "user",
          assignedPatients: userData.selectedPatients || [], // Toujours envoyer un array
        });
      }

      // Recharger les données après sauvegarde
      await loadData();

      toast({
        title: editingUser ? "Utilisateur modifié" : "Utilisateur ajouté",
        description: `L'utilisateur ${userData.username} a été ${
          editingUser ? "modifié" : "créé"
        } avec succès.`,
      });

      // Fermer les modales
      setIsAddUserOpen(false);
      setIsCredentialsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("❌ ADMIN - Erreur sauvegarde user:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const systemUsers = users.filter((user) => user.role !== "admin");
  const adminUser = users.find((user) => user.role === "admin");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Administration
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts and system settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Profile Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-primary" />
                <span>Profile Settings</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Update your account credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Current Username
                </label>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {adminUser?.username || "admin"}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleViewAdmin}
                  className="flex-1 text-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">View Admin Details</span>
                  <span className="sm:hidden">Details</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleEditAdmin}
                  className="flex-1 text-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Change Credentials</span>
                  <span className="sm:hidden">Edit</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Management Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Add and manage system users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Users
                </label>
                <p className="text-3xl font-bold text-primary mt-1">
                  {systemUsers.length}
                </p>
              </div>

              <Button
                onClick={handleAddUser}
                className="w-full bg-primary hover:bg-primary/90 transition-smooth text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Users Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>System Users</span>
            </CardTitle>
            <CardDescription>
              All registered users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold border-r min-w-[120px]">
                      Username
                    </TableHead>
                    <TableHead className="font-semibold border-r min-w-[140px]">
                      Patient Access
                    </TableHead>
                    <TableHead className="font-semibold border-r min-w-[120px] hidden md:table-cell">
                      Date Création
                    </TableHead>
                    <TableHead className="font-semibold min-w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/30 transition-smooth"
                    >
                      <TableCell className="font-medium border-r">
                        {user.username}
                      </TableCell>
                      <TableCell className="border-r">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {user.assignedPatients.length}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            patient(s)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="border-r hidden md:table-cell">
                        <div className="text-xs sm:text-sm">
                          {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-muted transition-smooth"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user.id)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Éditer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit User Dialog */}
        <AddUserDialog
          open={isAddUserOpen}
          onOpenChange={setIsAddUserOpen}
          onSave={handleUserSave}
          editingUser={editingUser}
          patients={patients}
        />

        {/* User Details Modal */}
        {viewingUser && (
          <UserDetailsModal
            open={isUserDetailsOpen}
            onOpenChange={setIsUserDetailsOpen}
            user={viewingUser}
            patients={patients}
          />
        )}

        {/* Change Credentials Modal */}
        {editingUser && (
          <ChangeCredentialsModal
            open={isCredentialsModalOpen}
            onOpenChange={setIsCredentialsModalOpen}
            user={editingUser}
            onSave={handleUserSave}
          />
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={confirmDeleteUser}
          title="Confirmer la suppression"
          description="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
          itemName={userToDelete ? userToDelete.username : ""}
        />
      </div>
    </Layout>
  );
};

export default Administration;
