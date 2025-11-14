<template>
  <!-- <div class="dashboard-header"> -->
  <!-- <div class="header-left">
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-date">{{ formattedDate }}</p>
    </div>
    <div class="header-right">
      <button class="btn-new-appointment" @click="handleNewAppointment">
        <i class="pi pi-plus"></i>
        Nueva Cita
      </button>
      <div class="search-container">
        <i class="pi pi-search"></i>
        <input
          type="text"
          placeholder="Buscar paciente..."
          v-model="searchQuery"
          @input="handleSearch"
          class="search-input"
        />
      </div>
      <button class="notification-btn">
        <i class="pi pi-bell"></i>
      </button>
      <div class="user-avatar">
        <span>{{ userInitials }}</span>
      </div>
    </div>
  </div> -->
</template>

<style scoped>
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 1.5rem 0;
    margin-bottom: 1.5rem;
  }

  .header-left {
    flex: 1;
  }

  .dashboard-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }

  .dashboard-date {
    font-size: 0.8125rem;
    color: #6b7280;
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn-new-appointment {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-new-appointment:hover {
    background: #047857;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
  }

  .search-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-container i {
    position: absolute;
    left: 0.875rem;
    color: #9ca3af;
    font-size: 0.875rem;
  }

  .search-input {
    padding: 0.625rem 1rem 0.625rem 2.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    width: 250px;
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }

  .notification-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #f3f4f6;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .notification-btn:hover {
    background: #e5e7eb;
    color: #374151;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #059669;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .header-right {
      width: 100%;
      flex-wrap: wrap;
    }

    .search-input {
      width: 100%;
    }
  }
</style>
