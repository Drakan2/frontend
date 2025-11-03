import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { dataService } from '@/shared/config/database';
import { getPatientStats } from '@/shared/utils/calculations';
import { UI_LABELS } from '@/shared/constants/ui';
import { Patient } from '@/shared/types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Activity,
  BarChart3 
} from 'lucide-react';

const Stats: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPatients = async () => {
      const loadedPatients = await dataService.getPatients();
      setPatients(loadedPatients);
    };
    loadPatients();
  }, []);

  const stats = getPatientStats(patients);

  const handleCardClick = (type: string) => {
    const typeMap: Record<string, string> = {
      'total': 'tous',
      'permanent': 'Permanent',
      'vacancier': 'Vacancier',
      'finTraitement': 'Fin Traitement'
    };
    
    if (type === 'total') {
      navigate('/patients');
    } else {
      navigate(`/patients?type=${encodeURIComponent(typeMap[type])}`);
    }
  };

  const statCards = [
    {
      title: UI_LABELS.total_patients,
      value: stats.total,
      description: 'Tous les patients enregistrés',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      type: 'total'
    },
    {
      title: UI_LABELS.permanent_patients,
      value: stats.permanent,
      description: 'Traitement à long terme',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      type: 'permanent'
    },
    {
      title: UI_LABELS.vacation_patients,
      value: stats.vacancier,
      description: 'Traitement temporaire',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      type: 'vacancier'
    },
    {
      title: 'Patients Fin Traitement',
      value: stats.finTraitement,
      description: 'Traitement terminé',
      icon: UserX,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      type: 'finTraitement'
    }
  ];

  const typeDistribution = [
    {
      label: 'Permanent',
      value: stats.permanent,
      percentage: Math.round((stats.permanent / stats.total) * 100),
      color: 'bg-success'
    },
    {
      label: 'Vacancier',
      value: stats.vacancier,
      percentage: Math.round((stats.vacancier / stats.total) * 100),
      color: 'bg-warning'
    },
    {
      label: 'Fin Traitement',
      value: stats.finTraitement,
      percentage: Math.round((stats.finTraitement / stats.total) * 100),
      color: 'bg-purple-600'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{UI_LABELS.stats_title}</h1>
            <p className="text-muted-foreground">
              {UI_LABELS.stats_subtitle}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`relative overflow-hidden shadow-sm hover:shadow-md transition-smooth cursor-pointer group border-2 ${stat.borderColor} ${stat.bgColor}`}
                onClick={() => handleCardClick(stat.type)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-white/80 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold mb-1 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Detailed Statistics */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Type Distribution */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>{UI_LABELS.type_distribution}</span>
              </CardTitle>
              <CardDescription>
                Répartition par type de traitement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {typeDistribution.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${type.color}`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{type.value}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {type.percentage}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={type.percentage} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Patient Status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>{UI_LABELS.patient_status}</span>
              </CardTitle>
              <CardDescription>
                Patients actifs vs inactifs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-success/10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-success/20 rounded-lg">
                      <UserCheck className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">{UI_LABELS.active_patients}</p>
                      <p className="text-sm text-muted-foreground">
                        Actuellement en traitement
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {stats.actifs}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-destructive/20 rounded-lg">
                      <UserX className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">{UI_LABELS.inactive_patients}</p>
                      <p className="text-sm text-muted-foreground">
                        Traitement terminé ou interrompu
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-destructive">
                    {stats.inactifs}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Stats;
